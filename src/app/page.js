import Image from "next/image";
import InvoiceForm from "./components/InvoiceForm";

export default function Home() {
  return (
    <div className="flex justify-center items-center text-3xl min-h-full py-16 font-light">
      <InvoiceForm />
    </div>
  );
}

// bg-[#700ED2]
