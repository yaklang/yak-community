import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import TopicList from "../components/TopicList";

export default function Home() {
    return (
        <div>
            <TopicList />
        </div>
    );
}
