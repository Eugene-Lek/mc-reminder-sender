import Link from 'next/link';
import { Header } from '../../src/components/Header';


function Settings() {
  return (
    <>
      <Header title={"Settings"} subtitle={"Configure column headers and message templates!"} prevPage={"/"}/>    
      <main className='h-auto flex items-center justify-center'>
        <div className='flex flex-col gap-10 items-center text-xl text-white'>
          <Link  href={"/settings/column-headers"} passHref><a className={"p-4 bg-green-500 rounded-lg hover:bg-green-200"}>Column Headers</a></Link>
          <Link  href={"/settings/message-templates"} passHref><a className={"p-4 bg-green-500 rounded-lg hover:bg-green-200 w-full text-center"}>Message Templates</a></Link>
        </div>
      </main>
    </>
  );
};

export default Settings;
