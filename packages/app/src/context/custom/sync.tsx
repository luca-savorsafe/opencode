import { createStore, reconcile } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { useGlobalSync } from "../global-sync"
import { useCustomSDK } from "./sdk"
import { base64Encode } from "@opencode-ai/util/encode"

export const { use: useCustomSync, provider: CustomSyncProvider } = createSimpleContext({
  name: "CUSTOM_SYNC",
  init: () => {
    const globalSync = useGlobalSync()
    const customSDK = useCustomSDK()
    const [store, setStore] = globalSync.child(customSDK.directory)

    const [referenceFileStore, setReferenceFileStore] = createStore({
      list: [] as Record<string, string>[],
      loading: false,
      complete: false,
      uploading: false,
    })

    const loadReferenceFile = async () => {
      if (referenceFileStore.loading) return
      setReferenceFileStore("loading", true)

      const directory = base64Encode(store.path.directory)
      await customSDK.client.referenceFile
        .list({ directory })
        .then((result: any) => {
          setReferenceFileStore("list", reconcile(result.files ?? [], { key: "name" }))
        })
        .finally(() => {
          setReferenceFileStore("loading", false)
        })
    }

    const uploadReferenceFile = async (formData: FormData) => {
      if (referenceFileStore.uploading) return
      setReferenceFileStore("uploading", true)

      const directory = base64Encode(store.path.directory)
      const result = await customSDK.client.referenceFile.upload(directory, formData)
      setReferenceFileStore("uploading", false)
      return result
    }

    const deleteReferenceFile = async (name: string) => {
      if (referenceFileStore.uploading) return
      setReferenceFileStore("uploading", true)

      const directory = base64Encode(store.path.directory)
      const result = await customSDK.client.referenceFile.remove({
        name: base64Encode(name),
        directory: directory,
      })
      setReferenceFileStore("uploading", false)
      return result
    }
    return {
      referenceFile: {
        getList: () => referenceFileStore.list,
        loading: () => referenceFileStore.loading,
        uploading: () => referenceFileStore.uploading,
        complete: () => referenceFileStore.complete,
        upload: async (formData: FormData) => {
          return uploadReferenceFile(formData)
        },
        fetch: async () => {
          await loadReferenceFile()
        },
        remove: async (name: string) => {
          return deleteReferenceFile(name)
        },
      },
    }
  },
})
