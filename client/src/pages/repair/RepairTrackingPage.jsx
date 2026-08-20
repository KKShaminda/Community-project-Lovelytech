import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Info,
  Search,
} from "lucide-react";

import Layout from "../../components/layout/Layout";

import {
  REPAIR_HISTORY,
  TRACKING_STEPS,
  REPAIR_UPDATES,
} from "../../data/repairData";
import { getRepairByTrackingId } from "../../services/repairServices";


export function RepairTrackingPage() {

  const [query, setQuery] = useState("PR124596");

  const [repair, setRepair] = useState(
    REPAIR_HISTORY[0]
  );

  const [trackingSteps, setTrackingSteps] = useState(TRACKING_STEPS);
  const [repairUpdates, setRepairUpdates] = useState(REPAIR_UPDATES);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRepair = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await getRepairByTrackingId(searchQuery.trim());
      const data = res?.data || res;
      if (data) {
        setRepair({
          id: data._id || data.id,
          trackingId: data.trackingId,
          deviceName: data.device || data.deviceName || "Device Repair",
          brandModel: `${data.brand || ""} ${data.model || ""}`.trim() || data.device,
          submitted: data.submitted || "Recently",
          estimatedCompletion: data.estimatedCompletion || "Pending",
          issue: data.issue,
        });
        if (data.trackingSteps && data.trackingSteps.length > 0) {
          setTrackingSteps(data.trackingSteps);
        }
        if (data.updates && data.updates.length > 0) {
          setRepairUpdates(data.updates);
        }
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error searching repair:", err);
      // Fallback check in local REPAIR_HISTORY if backend item not found
      const result = REPAIR_HISTORY.find(
        (item) =>
          item.trackingId.toLowerCase() ===
          searchQuery.trim().toLowerCase()
      );
      if (result) {
        setRepair(result);
        setTrackingSteps(TRACKING_STEPS);
        setRepairUpdates(REPAIR_UPDATES);
        setError(false);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepair("PR124596");
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    fetchRepair(query);
  };


  return (

    <Layout>

      <main className="min-h-screen bg-white">


        {/* Header */}
        <section className="bg-[#3E0F0F] py-16">

          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">


            <h1 className="text-4xl font-bold text-white sm:text-5xl">

              Repair
              <span className="text-[#EC1C24]">
                {" "}Tracking
              </span>

            </h1>


            <p className="mt-4 text-lg text-red-100">
              Track your repair process
            </p>


            <div className="mt-5 flex items-center gap-2 text-sm text-red-100">

              <span>
                Repair
              </span>

              <ChevronRight size={16} />

              <span className="font-semibold text-white">
                Repair Tracking
              </span>

            </div>


          </div>

        </section>




        {/* Search Section */}

        <section className="mx-auto max-w-[1080px] px-5 py-10">


          <form
            onSubmit={handleTrack}
            className="rounded-2xl bg-[#fbdfe1] p-5"
          >


            <div className="flex flex-col gap-4 sm:flex-row">


              <div className="relative flex-1">


                <input

                  value={query}

                  onChange={
                    (e) => setQuery(e.target.value)
                  }

                  placeholder="Enter repair tracking ID"

                  className="
                                w-full rounded-xl
                                bg-white px-5 py-4
                                outline-none
                                focus:ring-2
                                focus:ring-[#EC1C24]
                                "

                />


                <Search
                  className="
                                absolute right-5 top-4
                                text-gray-400
                                "
                />


              </div>



              <button

                className="
                            rounded-xl
                            bg-[#EC1C24]
                            px-8 py-3
                            font-bold text-white
                            hover:bg-[#cf1414]
                            "

              >

                Track Repair

              </button>


            </div>



            <p className="mt-3 flex gap-2 text-sm text-gray-500">

              <CircleAlert size={18} />

              Tracking ID was sent after submitting your repair request.

            </p>


          </form>



          {
            error &&

            <div className="mt-5 rounded-xl bg-red-100 p-4 text-red-600">

              Repair ID not found.

            </div>

          }


        </section>






        {/* Details */}

        <section className="mx-auto max-w-[1080px] px-5 pb-10">


          <div className="
                grid gap-10
                rounded-2xl
                border-t-4
                border-[#EC1C24]
                bg-white
                p-8
                shadow-md
                lg:grid-cols-2
                ">


            {/* Details */}

            <div>


              <div className="flex items-center gap-4">


                <h2 className="text-2xl font-bold">

                  Repair Details

                </h2>


                <span className="
                            rounded-full
                            bg-red-100
                            px-3 py-1
                            text-sm
                            text-[#EC1C24]
                            ">

                  {repair.trackingId}

                </span>


              </div>



              <h3 className="
                        mt-8 text-xl font-semibold
                        ">

                {repair.deviceName}

              </h3>



              <ul className="
                        mt-5 space-y-4
                        text-gray-500
                        ">


                <li className="flex gap-3">

                  <CalendarDays />

                  Submitted:
                  {" "}
                  {repair.submitted}

                </li>


                <li className="flex gap-3">

                  <ClipboardCheck />

                  Estimated Completion:
                  {" "}
                  {repair.estimatedCompletion}

                </li>



                <li className="flex gap-3">

                  <Info />

                  Issue:
                  {" "}
                  {repair.issue}

                </li>


              </ul>


            </div>






            {/* Timeline */}

            <div>


              {
                trackingSteps.map(
                  (step, index) => (

                    <div
                      key={step.label || index}
                      className="relative flex gap-5 pb-8"
                    >


                      {
                        index !== trackingSteps.length - 1 &&

                        <span className="
                                absolute
                                left-3 top-7
                                h-full w-[2px]
                                bg-gray-200
                                "/>

                      }



                      <div
                        className={`
                            z-10 flex h-7 w-7
                            items-center justify-center
                            rounded-full
                            ${step.status === "complete"
                            ?
                            "bg-green-500 text-white"
                            :
                            "bg-gray-200"
                          }
                            `}
                      >

                        {
                          step.status === "complete"
                          &&
                          <Check size={18} />
                        }

                      </div>



                      <div>

                        <h3 className="font-semibold">

                          {step.label}

                        </h3>


                        <p className="text-sm text-gray-500">

                          {step.detail}

                        </p>


                      </div>



                    </div>


                  )
                )
              }


            </div>


          </div>


        </section>






        {/* Updates */}

        <section className="mx-auto max-w-[1080px] px-5 pb-16">


          <h2 className="mb-6 text-2xl font-bold">

            Repair Updates

          </h2>



          <div className="space-y-5">


            {
              repairUpdates.map((update, index) => (

                <div
                  key={update.id || index}
                  className="
                    rounded-2xl
                    border-t-4
                    border-[#EC1C24]
                    bg-white
                    p-6
                    shadow-md
                    "
                >


                  <h3 className="text-lg font-semibold">

                    {update.title}

                  </h3>


                  <p className="mt-2 text-gray-500">

                    {update.description}

                  </p>


                  <p className="mt-2 text-sm text-gray-400">

                    {update.timeAgo}
                    {" • "}
                    {update.date}

                  </p>


                </div>


              ))
            }


          </div>


        </section>



      </main>

    </Layout>

  );

}


export default RepairTrackingPage;
