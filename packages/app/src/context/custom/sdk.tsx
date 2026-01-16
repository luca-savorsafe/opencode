import { createCustomClient } from "@opencode-ai/sdk/v2/client"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { useSDK } from "../sdk"
import { usePlatform } from "../platform"

export const { use: useCustomSDK, provider: CustomSDKProvider } = createSimpleContext({
  name: "CUSTOM_SDK",
  init: () => {
    const platform = usePlatform()
    const sdk = useSDK()
    const customSDK = createCustomClient({
      baseUrl: sdk.url,
      fetch: platform.fetch,
      directory: sdk.directory,
      throwOnError: true,
    })

    return { directory: sdk.directory, client: customSDK, event: sdk.event, url: sdk.url }
  },
})
