import '../styles/globals.css'
import Head from 'next/head';
import Link from 'next/link';
import { Footer } from '../src/components/Footer';
import DialogContext from '../src/helpers/dialogContext';
import { Dialog } from '../src/components/Dialog';

export default function MyApp({ Component, pageProps }) {
    return (
        <>
            <DialogContext>
                <Head>
                    <title>MC Reminder Sender</title>
                </Head>
                <div className="flex flex-col h-screen justify-between">
                    <Component {...pageProps} />
                    <Footer />
                </div>
                <Dialog/>
            </DialogContext>
        </>
    );
}