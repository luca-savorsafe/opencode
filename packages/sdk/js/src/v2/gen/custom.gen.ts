import { OpencodeClient } from "./sdk.gen.js"
import { type Client } from "./client/types.gen.js"
import { buildClientParams, type Options } from "./client/index.js"

export class ReferenceFile extends OpencodeClient {
  public async list<ThrowOnError extends boolean = false>(
    parameters?: {
      directory?: string
    },
    options?: Options<never, ThrowOnError>,
  ) {
    const params = buildClientParams([parameters], [{ args: [{ in: "query", key: "directory" }] }])
    const response = await this.client.get<boolean, unknown, ThrowOnError>({
      url: "/reference-file",
      ...options,
      ...params,
    })
    return response.data
  }

  public async upload(directory: string, body: FormData): Promise<Response> {
    const config = this.client.getConfig()
    const response = await fetch(`${config.baseUrl}/reference-file/upload?directory=${directory}`, {
      method: "POST",
      body: body as unknown as BodyInit,
    })
    return response.json()
  }

  public async remove(parameters: { name: string; directory: string }) {
    const params = buildClientParams(
      [parameters],
      [
        {
          args: [
            { in: "query", key: "name" },
            { in: "query", key: "directory" },
          ],
        },
      ],
    )
    const response = await this.client.delete<boolean, unknown, boolean>({
      url: `/reference-file/remove-file`,
      ...params,
    })
    return response.data
  }
}

export class CustomClient extends OpencodeClient {
  constructor(args?: { client?: Client }) {
    super(args)
  }

  referenceFile = new ReferenceFile({ client: this.client })
}
