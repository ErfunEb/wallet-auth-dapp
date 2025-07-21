"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";

import styles from "../styles/Home.module.css";
import Auth from "../components/Auth";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <meta property="og:title" content="Web3 Wallet Auth DApp" />
        <meta
          property="og:description"
          content="Secure login using Ethereum wallet and JWT tokens."
        />
        <meta
          name="keywords"
          content="Web3, Ethereum, Wallet Login, RainbowKit, Next.js"
        />
        <title>Wallet Auth Dapp</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />
        <Auth />
      </main>
    </div>
  );
};

export default Home;
