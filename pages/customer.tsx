
import { Lucid, SpendingValidator } from 'lucid-cardano';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import CustomerTable from '../components/CustomerTable';
import LoadingModal from '../components/LoadingModal';
import MessageModal from '../components/MessageModal';
import WalletConnect from '../components/WalletConnect';
import { CustomerData, getCompiledProgram, getCustomerSubscriptions, ServiceData } from '../utils/contract';
import initLucid from '../utils/lucid';
import { useStoreState } from '../utils/store';

///IDEA: Poner un seleccioandor para qu eel vendor pueda ingresar su address, en lugar de solo conectarlo?
const CustomerPage: NextPage = () => {
    const [customerAddress, setCustomerAddress] = useState("")
    const [subscriptionList, setSubscriptionList] = useState<ServiceData[]>([])
    const [lucid, setLucid] = useState<Lucid>()
    const walletStore = useStoreState((state: any) => state.wallet)
    const [scriptAddress, setScriptAddress] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [displayMessage, setDisplayMessage] = useState<{ title: string, message: string }>({ title: "", message: "" })
    const [showModal, setShowModal] = useState<boolean>(false)

    useEffect(() => {
        if (!lucid) {
            if (walletStore.name != "") {
                setLoading(true)
                initLucid(walletStore.name).then((Lucid: Lucid) => { setLucid(Lucid) })
            } else {
                setLoading(false)
                setDisplayMessage({ title: "Not connected", message: "Close this modal and connect your wallet." })
                setShowModal(true)
            }
        } else {
            setLoading(true)
            const thisScript: SpendingValidator = {
                type: "PlutusV2",
                script: JSON.parse(getCompiledProgram().serialize()).cborHex,
            };
            const scriptAddr = lucid.utils.validatorToAddress(thisScript)
            setScriptAddress(scriptAddr)
            setCustomerAddress(walletStore.address)
            getSubscriptionList(walletStore.address, scriptAddr)
        }
    }, [lucid, walletStore.name, walletStore.address])

    const getSubscriptionList = async (customerAddress: string, scriptAddress: string) => {
        const utxos = await lucid!.utxosAt(scriptAddress)
        console.log("customer address: ", customerAddress)
        const subscriptions = await getCustomerSubscriptions(lucid!, customerAddress, utxos)
        console.log(subscriptions, utxos)
        setSubscriptionList(subscriptions)
        setLoading(false)
    }

    return (
        <>
            <div className="hero min-h-screen bg-base-200 w-full">
                <div className="hero-content flex-col w-full">
                    <LoadingModal active={loading} />
                    <MessageModal message={displayMessage.message} active={showModal} title={displayMessage.title} />

                    <div className="card flex-shrink-0 shadow-2xl bg-base-100">
                        <div className="card-body mb-20 mx-5">
                            <div className="text-center lg:text-left">
                                <h1 className="text-3xl font-bold">Subscriptions</h1>
                                <p className="py-4 break-all max-w-fit">Connect your wallet to see your active subscriptions.</p>
                                <WalletConnect />
                                {/* <input type="text" onChange={(e) => { setCustomerAddress(e.target.value) }} value={customerAddress} placeholder="Enter vendor address" className="input input-bordered input-primary w-full max-w-xs" />
            <button disabled={!customerAddress.startsWith("addr")} className={`btn btn-primary`} onClick={() => { getSubscriptionList(walletStore.address)}} >Search</button> */}
                                {walletStore.address && <CustomerTable subscriptionList={subscriptionList} scriptAddress={scriptAddress} customerAddress={customerAddress} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CustomerPage;