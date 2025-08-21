import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Button variant="link"><Link href="sign-in">Sign In</Link></Button>
      <Button variant="link"><Link href="sign-up">Sign Up</Link></Button>
    </>
  );
}
