import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
    SearchIcon,
    CheckIcon
} from "lucide-react";

import {
    TRACKING_STEPS
} from "../../data/repairData";


export function RepairTrackingPage() {

    const [id, setId] = useState("");


    return (

        <Layout>

            <main className="min-h-screen bg-white">


                <section className="bg-[#3E0F0F] py-16 text-center">

                    <h1 className="text-5xl font-bold text-white">
                        Track <span className="text-[#EC1C24]">
                            Repair
                        </span>
                    </h1>

                </section>


                <section className="max-w-5xl mx-auto px-5 py-10">


                    <div className="flex gap-3">

                        <input
                            className="flex-1 rounded-full border px-6"
                            placeholder="Enter Tracking ID"
                        />

                        <button className="bg-[#EC1C24] text-white px-8 rounded-full">
                            Track
                        </button>

                    </div>



                    <div className="mt-10 rounded-3xl shadow p-8">


                        {
                            TRACKING_STEPS.map((step) => (

                                <div className="flex gap-5 mb-8">

                                    <div className="h-8 w-8 rounded-full bg-[#EC1C24] text-white flex items-center justify-center">

                                        <CheckIcon size={18} />

                                    </div>


                                    <div>

                                        <h3 className="font-bold">
                                            {step.label}
                                        </h3>

                                        <p className="text-gray-500">
                                            {step.detail}
                                        </p>

                                    </div>


                                </div>


                            ))
                        }


                    </div>


                </section>


            </main>


        </Layout>

    )

}