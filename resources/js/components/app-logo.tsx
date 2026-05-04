export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
                <img
                    src="/images/iconfinder_vector_65_09_473792 1.png"
                    alt="KSCF Logo"
                    className="size-8 object-contain rounded-md"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-bold text-white">
                    KSCF Cooperative
                </span>
                <span className="truncate text-[10px] text-white/60 leading-tight">
                    Katipunan Small Coconut Farmers
                </span>
            </div>
        </>
    );
}
