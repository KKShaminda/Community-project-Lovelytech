import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import {
    CalendarIcon,
    InfoIcon
} from "lucide-react";

import {
    REPAIR_HISTORY
} from "../../data/repairData";


export function RepairHistoryPage() {

    const navigate = useNavigate();


    return (

        <Layout>

            <main className="min-h-screen bg-white">


                <section className="bg-[#3E0F0F] py-16 text-center">

                    <h1 className="text-5xl font-bold text-white">
                        Repair <span className="text-[#EC1C24]">
                            History
                        </span>
                    </h1>

                </section>



                <section className="max-w-5xl mx-auto px-5 py-16 space-y-6">


                    {
                        REPAIR_HISTORY.map(item => (

                            <div
                                key={item.id}
                                onClick={() => navigate(`/repair/track?id=${item.trackingId}`)}
                                className="
cursor-pointer rounded-2xl
border-t-4 border-[#EC1C24]
p-6 shadow
"
                            >


                                <h2 className="text-2xl font-bold">
                                    {item.deviceName}
                                </h2>


                                <p className="text-[#EC1C24]">
                                    {item.trackingId}
                                </p>


                                <div className="mt-5 space-y-3 text-gray-500">


                                    <p>
                                        <CalendarIcon className="inline mr-2" />
                                        Submitted:
                                        {item.submitted}
                                    </p>


                                    <p>
                                        <InfoIcon className="inline mr-2" />
                                        Issue:
                                        {item.issue}
                                    </p>


                                </div>


                            </div>


                        ))
                    }


                </section>


            </main>


        </Layout>


    )

}