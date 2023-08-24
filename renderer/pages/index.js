import Link from 'next/link';
import { Header } from '../src/components/Header';


function Home() {
  return (
    <>
      <Header title={"MC Reminder Sender"} subtitle={"Automate Whatsapp reminders for MC submission"} prevPage={null}/>    
      <main className='h-auto flex items-center justify-center'>
        <div className='flex flex-col gap-10 items-center text-xl text-white'>
          <Link  href={"/send-reminders"} passHref><a className={"p-4 bg-green-500 rounded-lg hover:bg-green-200"}>Send Reminders</a></Link>
          <Link  href={"/settings"} passHref><a className={"p-4 bg-green-500 rounded-lg hover:bg-green-200 w-full text-center"}>Settings</a></Link>
        </div>
      </main>
    </>
  );
};

export default Home;
