import { ReferenceFileHeader, ReferenceFileList } from "@/components/reference-file"

export default function ReferenceFile() {
  return (
    <div class="relative bg-background-base size-full overflow-hidden flex flex-col">
      <ReferenceFileHeader />
      <ReferenceFileList />
    </div>
  )
}
