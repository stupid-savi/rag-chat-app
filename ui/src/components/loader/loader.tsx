import { Skeleton } from "../ui/skeleton"

const Loader = () => {
    return <div className="flex flex-col gap-4 w-screen h-screen p-8 bg-muted overflow-y-auto">
        <div className="flex items-start gap-3 self-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2">
                <Skeleton className="w-60 h-5 rounded-md" />
                <Skeleton className="w-72 h-6 rounded-md" />
            </div>
        </div>

        <div className="flex items-start gap-3 self-end flex-row-reverse">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2 items-end">
                <Skeleton className="w-40 h-5 rounded-md" />
                <Skeleton className="w-48 h-6 rounded-md" />
            </div>
        </div>

        <div className="flex items-start gap-3 self-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2">
                <Skeleton className="w-52 h-5 rounded-md" />
                <Skeleton className="w-64 h-6 rounded-md" />
            </div>
        </div>

        <div className="flex items-start gap-3 self-end flex-row-reverse">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2 items-end">
                <Skeleton className="w-44 h-5 rounded-md" />
                <Skeleton className="w-56 h-6 rounded-md" />
            </div>
        </div>
        <div className="flex items-start gap-3 self-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2">
                <Skeleton className="w-60 h-5 rounded-md" />
                <Skeleton className="w-72 h-6 rounded-md" />
            </div>
        </div>

        <div className="flex items-start gap-3 self-end flex-row-reverse">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2 items-end">
                <Skeleton className="w-40 h-5 rounded-md" />
                <Skeleton className="w-48 h-6 rounded-md" />
            </div>
        </div>

        <div className="flex items-start gap-3 self-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2">
                <Skeleton className="w-52 h-5 rounded-md" />
                <Skeleton className="w-64 h-6 rounded-md" />
            </div>
        </div>


    </div>
}

export default Loader