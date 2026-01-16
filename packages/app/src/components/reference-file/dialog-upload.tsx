import { FileIcon } from "@opencode-ai/ui/file-icon"
import { For, Show, createMemo, createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { showToast } from "@opencode-ai/ui/toast"
import { useCustomSync } from "@/context/custom"
import { Dialog } from "@opencode-ai/ui/dialog"

// pdf, docx, txt, md, html, csv, ppt, xls, xlsx, pptx, json, yaml, xml,
const ACCEPTED_FILE_TYPES = [
  "application/msword",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/html",
  "text/csv",
  "application/vnd.ms-powerpoint",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/json",
  "application/yaml",
  "application/xml",
  ".md",
]

const MAX_FILE_SIZE = 100 * 1024 * 1024
const MAX_FILE_COUNT = 10

export function DialogUpload({ onSuccess }: { onSuccess?: () => void }) {
  let fileInputRef!: HTMLInputElement

  const sync = useCustomSync()
  const [selectedFiles, setSelectedFiles] = createSignal<File[]>([])

  const hasFiles = createMemo(() => selectedFiles().length > 0)
  const uploading = createMemo(() => sync.referenceFile.uploading())

  function checkFileSize(files: File[]): boolean {
    let valid = true
    let totalSize = 0
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        showToast({
          description: `文件大小超过${MAX_FILE_SIZE / 1024 / 1024}MB`,
          variant: "error",
        })
        valid = false
      }
      totalSize += file.size
    })
    if (totalSize > MAX_FILE_SIZE) {
      showToast({
        description: `文件大小超过${MAX_FILE_SIZE / 1024 / 1024}MB`,
        variant: "error",
      })
      valid = false
    }
    return valid
  }

  function addAttachment(files: FileList) {
    const newFiles = Array.from(files)
    const allFiles = [...selectedFiles(), ...newFiles]
    if (allFiles.length > MAX_FILE_COUNT) {
      showToast({
        description: `最多选择${MAX_FILE_COUNT}个文件`,
        variant: "error",
      })
      return
    }
    setSelectedFiles(allFiles)
  }

  function removeFile(file: File) {
    setSelectedFiles(selectedFiles().filter((f) => f.name !== file.name))
  }

  function formatFileSize(size: number) {
    if (size < 1024) {
      return `${size}B`
    }
    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)}KB`
    }
    return `${Math.round(size / 1024 / 1024)}MB`
  }

  function uploadFiles() {
    const files = selectedFiles()
    if (!checkFileSize(files)) return
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })
    sync.referenceFile.upload(formData).then((result) => {
      if (result) {
        showToast({
          description: "上传成功",
          variant: "success",
        })
        setSelectedFiles([])
        onSuccess?.()
      }
    })
  }

  return (
    <Dialog title="上传参考文档">
      <div class="p-4">
        <input
          type="file"
          multiple
          ref={fileInputRef}
          class="hidden"
          accept={ACCEPTED_FILE_TYPES.join(",")}
          onChange={(e) => {
            const files = e.currentTarget.files
            if (files?.length) addAttachment(files)
            e.currentTarget.value = ""
          }}
        />

        <div class="flex flex-col justify-center items-center">
          <Show when={hasFiles()}>
            <div class="flex flex-col w-full mb-1 border border-border-base rounded-md p-2">
              <p>
                已选择 <span class="text-text-strong">{selectedFiles().length}</span> 个文件
              </p>
              <div class="flex-1 flex flex-col mt-1">
                <For each={selectedFiles()}>
                  {(file) => (
                    <div class="flex-1 flex items-center gap-2 hover:bg-surface-raised-base-hover rounded-md group">
                      <FileIcon node={{ path: file.name, type: "file" }} class="shrink-0 size-4" />
                      <span
                        class="text-text-strong whitespace-nowrap flex-1 text-ellipsis overflow-hidden"
                        style={{ "max-width": "380px" }}
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <span class="text-text-weak text-12-regular">{formatFileSize(file.size)}</span>
                      <IconButton
                        icon="close"
                        variant="ghost"
                        class="h-6 w-6 invisible group-hover:visible"
                        onClick={() => removeFile(file)}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
          <div class="w-full mt-2 flex justify-center">
            <Button size="large" variant="secondary" onClick={() => fileInputRef.click()}>
              选择文件
            </Button>
          </div>
          <div class="w-full">
            <div class="text-text-base mt-4">
              <span>支持的文件大小：</span>
              <span>单文件不超过100MB，最多10个文件</span>
            </div>
            <div class="text-text-base mt-1">
              <span>支持的文件类型：</span>
              <span>pdf, docx, txt, md, html, csv 等</span>
            </div>
          </div>
        </div>
        <Show when={hasFiles()}>
          <div class="w-full mt-2 flex justify-end">
            <Button
              size="large"
              icon="arrow-up"
              variant="primary"
              loading={uploading()}
              disabled={uploading()}
              onClick={uploadFiles}
            >
              上传
            </Button>
          </div>
        </Show>
      </div>
    </Dialog>
  )
}
