import { Hono } from "hono"
import { bodyLimit } from "hono/body-limit"
import path from "path"
import fs from "fs"
import { base64Decode } from "@opencode-ai/util/encode"

const getDirectory = (directory: string) => {
  return path.join(base64Decode(directory), "__reference")
}

export const ReferenceFileRoute = new Hono()
  .get("/", async (c) => {
    const directory = c.req.query("directory")
    if (!directory) {
      return c.json({ error: "Directory is required" }, 400)
    }

    const referencePath = getDirectory(directory)
    // 按上传时间排序，倒序
    const files = (fs.readdirSync(referencePath) || [])
      .sort((a, b) => {
        return (
          fs.statSync(path.join(referencePath, b)).mtime.getTime() -
          fs.statSync(path.join(referencePath, a)).mtime.getTime()
        )
      })
      .map((file) => {
        const stats = fs.statSync(path.join(referencePath, file))
        return {
          name: file,
          size: stats.size,
          createdAt: stats.mtime.getTime(),
        }
      })
    return c.json({ files })
  })
  .post(
    "/upload",
    bodyLimit({
      maxSize: 100 * 1024 * 1024, // 100mb
      onError: (c) => {
        return c.text("overflow :(", 413)
      },
    }),
    async (c) => {
      try {
        const directory = c.req.query("directory")
        if (!directory) {
          return c.json({ error: "Directory is required" }, 400)
        }

        const formData = await c.req.formData()
        const files = formData.getAll("files")
        if (!files || files.length === 0) {
          return c.json({ error: "No files found" }, 400)
        }

        const referencePath = getDirectory(directory)

        if (!fs.existsSync(referencePath)) {
          fs.mkdirSync(referencePath, { recursive: true })
        }

        for (const file of files) {
          if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer()
            const filePath = path.join(referencePath, file.name)

            fs.writeFileSync(filePath, Buffer.from(arrayBuffer))
            console.log(`Saved: ${filePath}`)
          }
        }

        return c.json(true)
      } catch (error) {
        console.error("Upload Error:", error)
        return c.json({ error: (error as Error).message }, 500)
      }
    },
  )
  .delete("/remove-file", async (c) => {
    try {
      const directory = c.req.query("directory")
      if (!directory) {
        return c.json({ error: "Directory is required" }, 400)
      }
      const name = c.req.query("name")
      if (!name) {
        return c.json({ error: "Name is required" }, 400)
      }

      const referencePath = getDirectory(directory)
      fs.unlinkSync(path.join(referencePath, base64Decode(name)))
      return c.json(true)
    } catch (error) {
      console.error("Remove File Error:", error)
      return c.json({ error: (error as Error).message }, 500)
    }
  })
