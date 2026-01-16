import { createMemo, createEffect } from "solid-js"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { useNavigate } from "@solidjs/router"
import { base64Encode } from "@opencode-ai/util/encode"

export const FileAddButton = (props: { directory: string }) => {
  const navigate = useNavigate()

  const encodedDirectory = createMemo(() => base64Encode(props.directory))

  const handleClick = () => {
    navigate(`/${encodedDirectory()}/reference-file`)
  }

  return (
    <Tooltip placement="right" value="参考文档">
      <IconButton icon="folder" variant="ghost" size="large" onClick={handleClick} />
    </Tooltip>
  )
}
