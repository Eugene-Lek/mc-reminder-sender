import Image from "next/image"
import Link from "next/link"

export const Header = ({ title, subtitle, prevPage }) => {
    return (
        <header className="flex flex-row bg-imperial-red">
            <div className="flex flex-col gap-2 p-4 items-center relative left-1/2 -translate-x-1/2">
                <h1 className="font-bold text-2xl text-white text-center">{title}</h1>
                <h3 className="text-sm text-white text-center max-w-lg">{subtitle}</h3>
            </div>
            {prevPage ?
                <Link href={prevPage} className="fixed left-10">
                    <div className="hover:cursor-pointer flex justify-center items-center absolute left-10 top-5">
                        <Image
                            priority
                            src={`/icons/back-arrow.svg`}
                            height={48}
                            width={48}
                            className={`w-6 h-6 stroke-1`}
                        />
                    </div>
                </Link>
                :
                <></>
            }            
        </header>
    )
}