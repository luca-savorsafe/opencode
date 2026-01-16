import { createMemo, For, onMount, Show } from "solid-js"
import { useCustomSync } from "@/context/custom"
import { FileIcon } from "@opencode-ai/ui/file-icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { formatFileSize } from "./utils"
import { DialogUpload } from "./dialog-upload"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { Button } from "@opencode-ai/ui/button"

export function ReferenceFileList() {
  const dialog = useDialog()
  const customSync = useCustomSync()
  const fileList = createMemo(() => customSync.referenceFile.getList())
  const hasFiles = createMemo(() => fileList().length > 0)

  onMount(() => {
    refreshFileList()
  })

  async function removeFile(file: Record<string, string>) {
    const result = await customSync.referenceFile.remove(file.name)
    if (result) {
      refreshFileList()
    }
  }

  function refreshFileList() {
    customSync.referenceFile.fetch()
  }

  const handleUploadSuccess = () => {
    refreshFileList()
    dialog.close()
  }

  function uploadReferenceFile() {
    dialog.show(() => <DialogUpload onSuccess={handleUploadSuccess} />)
  }

  return (
    <div class="p-4">
      <div class="flex flex-col justify-center items-center">
        <div class="w-full mt-2 flex items-center justify-between mb-2">
          <p class="text-14-medium text-text-base">
            当前 <span class="text-text-strong">{fileList().length}</span> 个文件
          </p>
          <Button icon="plus" size="large" variant="primary" class="cursor-pointer" onClick={uploadReferenceFile}>
            添加参考文档
          </Button>
        </div>
        <Show when={hasFiles()}>
          <div class="w-full mb-1 border border-border-base rounded-md p-2">
            <div class="flex-1 flex flex-col gap-y-2">
              <For each={fileList()}>
                {(file) => (
                  <div class="flex-1 flex items-center gap-2 text-14-medium hover:bg-surface-raised-base-hover rounded-md group py-1 px-1">
                    <FileIcon node={{ path: file.name, type: "file" }} class="shrink-0 size-5" />
                    <span
                      class="text-text-strong whitespace-nowrap flex-1 text-ellipsis overflow-hidden"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    <span class="text-text-weak text-12-regular">{formatFileSize(Number(file.size))}</span>
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
        <Show when={!hasFiles()}>
          <div class="w-full pt-6 flex justify-center items-center">
            <p class="text-14-medium text-text-weak">当前没有参考文档~~</p>
          </div>
        </Show>
      </div>
    </div>
  )
}
