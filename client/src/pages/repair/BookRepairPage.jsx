import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2Icon,
    CircleAlertIcon,
    ChevronRightIcon,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { DEVICE_CATEGORIES } from "../../data/repairData";


const inputClass =
    "mt-1.5 w-full rounded-[14px] border border-[#ff8b92] bg-white px-4 py-3 text-[16px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#ef1d2c] focus:ring-2 focus:ring-red-100";


export function BookRepairPage() {

    const [device, setDevice] = useState("smart-phone");

    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [imei, setImei] = useState("");
    const [issue, setIssue] = useState("");

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const [submitted, setSubmitted] = useState(false);


    const handleSubmit = (e) => {

        e.preventDefault();

        if (
            brand &&
            model &&
            issue &&
            name &&
            phone &&
            email
        ) {
            setSubmitted(true);
        }

    };


    return (

        <Layout>

            <main className="min-h-screen bg-white">


                {/* Heading */}

                <section className="mx-auto max-w-[1320px] px-6 pb-10 pt-10 sm:px-10 lg:px-14">

                    <div className="flex flex-wrap items-end justify-between gap-4">

                        <div>

                            <h1 className="text-4xl font-bold text-[#EC1C24]">
                                Book a Repair
                            </h1>

                            <p className="mt-2 text-lg text-neutral-500">
                                Fill out the form below with details about your device and issue
                            </p>

                        </div>


                        <div className="hidden items-center gap-2 text-sm sm:flex">

                            <span className="text-gray-500">
                                Repair
                            </span>

                            <ChevronRightIcon size={16} />

                            <span className="font-semibold">
                                Book Repair
                            </span>

                        </div>


                    </div>

                </section>




                {/* Device Categories */}

                <section className="bg-[#3E0F0F] py-14">

                    <div className="
mx-auto grid max-w-[1320px]
gap-6 px-6
sm:grid-cols-2
lg:grid-cols-5
">


                        {
                            DEVICE_CATEGORIES.map((item) => (


                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setDevice(item.id)}
                                    className={`
overflow-hidden rounded-[15px]
bg-white text-left
shadow-lg
transition
hover:-translate-y-1

${device === item.id
                                            ?
                                            "ring-4 ring-[#EC1C24]"
                                            :
                                            ""
                                        }
`}
                                >


                                    <div className="border-t-4 border-[#EC1C24]">

                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-44 w-full object-cover"
                                        />

                                    </div>



                                    <div className="px-5 pb-5 pt-3">

                                        <h2 className="font-bold text-[#EC1C24]">
                                            {item.name}
                                        </h2>


                                        <p className="mt-2 whitespace-pre-line text-sm text-gray-500">
                                            {item.description}
                                        </p>


                                    </div>


                                </button>


                            ))
                        }


                    </div>

                </section>





                {/* FORM */}

                <section className="mx-auto max-w-[1320px] px-6 py-12 sm:px-10 lg:px-14">


                    {
                        submitted ?


                            <motion.div

                                initial={{
                                    opacity: 0,
                                    y: 20
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}

                                className="
mx-auto max-w-xl
rounded-2xl
border-t-4 border-[#EC1C24]
bg-white
p-10
text-center
shadow-lg
"

                            >


                                <CheckCircle2Icon
                                    className="mx-auto text-green-500"
                                    size={60}
                                />


                                <h2 className="mt-5 text-2xl font-bold">

                                    Repair Request Submitted

                                </h2>


                                <p className="mt-3 text-gray-500">

                                    Your tracking ID is

                                    <strong className="ml-1">
                                        PR124596
                                    </strong>

                                </p>



                                <button

                                    onClick={() => setSubmitted(false)}

                                    className="
mt-6 rounded-xl
bg-black px-6 py-3
font-bold text-white
"

                                >

                                    Submit Another Request

                                </button>



                            </motion.div>



                            :


                            <form

                                onSubmit={handleSubmit}

                                className="
rounded-2xl
border-t-4 border-[#EC1C24]
bg-white
p-6
shadow-lg
sm:p-10
"


                            >


                                <div className="grid gap-12 md:grid-cols-2">



                                    {/* Device */}

                                    <div>

                                        <h2 className="text-2xl font-bold">
                                            Device Information
                                        </h2>


                                        <div className="mt-8 space-y-6">


                                            <label className="text-gray-500">
                                                Brand Name

                                                <input
                                                    className={inputClass}
                                                    value={brand}
                                                    onChange={(e) => setBrand(e.target.value)}
                                                />

                                            </label>



                                            <label className="text-gray-500">
                                                Model Name

                                                <input
                                                    className={inputClass}
                                                    value={model}
                                                    onChange={(e) => setModel(e.target.value)}
                                                />

                                            </label>




                                            <label className="text-gray-500">
                                                IMEI No

                                                <input
                                                    className={inputClass}
                                                    value={imei}
                                                    onChange={(e) => setImei(e.target.value)}
                                                />

                                            </label>



                                            <label className="text-gray-500">

                                                Description of issue

                                                <textarea

                                                    rows="4"

                                                    className={`${inputClass} resize-none`}

                                                    value={issue}

                                                    onChange={(e) => setIssue(e.target.value)}

                                                    required

                                                />

                                            </label>



                                        </div>

                                    </div>





                                    {/* Contact */}

                                    <div>


                                        <h2 className="text-2xl font-bold">
                                            Contact Information
                                        </h2>


                                        <div className="mt-8 space-y-6">


                                            <input
                                                className={inputClass}
                                                placeholder="Your Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />


                                            <input
                                                className={inputClass}
                                                placeholder="Phone Number"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                            />


                                            <input
                                                className={inputClass}
                                                placeholder="Email Address"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />


                                            <textarea
                                                className={`${inputClass} resize-none`}
                                                rows="4"
                                                placeholder="Address"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />


                                        </div>

                                    </div>


                                </div>




                                <div className="
mt-8 flex gap-3
rounded-xl
bg-red-100
px-5 py-4
text-sm text-gray-600
">


                                    <CircleAlertIcon />

                                    Once submitted our technicians will review your request and contact you.


                                </div>




                                <button

                                    type="submit"

                                    className="
mx-auto mt-8 block
w-full max-w-xl
rounded-xl
bg-black
px-6 py-4
font-bold
text-white
hover:bg-gray-800
"

                                >

                                    Submit Repair Request

                                </button>



                            </form>


                    }


                </section>



            </main>


        </Layout>

    )

}