
import { Lucid, SpendingValidator } from 'lucid-cardano';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import LoadingModal from '../components/LoadingModal';
import MessageModal from '../components/MessageModal';
import VendorTable from '../components/VendorTable';
import WalletConnect from '../components/WalletConnect';
import { CustomerData, getCompiledProgram, getVendorSubscriptions } from '../utils/contract';
import initLucid from '../utils/lucid';
import { useStoreState } from '../utils/store';
///IDEA: Poner un seleccioandor para qu eel vendor pueda ingresar su address, en lugar de solo conectarlo?
const VendorPage: NextPage = () => {
    const [vendorAddress, setVendorAddress] = useState("")
    const [customerList, setCustomerList] = useState<CustomerData[]>([])
    const [lucid, setLucid] = useState<Lucid>()
    const walletStore = useStoreState((state: any) => state.wallet)
    const [scriptAddress, setScriptAddress] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [displayMessage, setDisplayMessage] = useState<{ title: string, message: string }>({ title: "", message: "" })
    const [showModal, setShowModal] = useState<boolean>(false)

    useEffect(() => {
        if (!lucid) {
            if (walletStore.name != "") {
                console.log("hello")
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
            console.log(scriptAddr)
            setScriptAddress(scriptAddr)
            setVendorAddress(walletStore.address)
            getCustomerList(walletStore.address, scriptAddr)
        }
    }, [lucid, walletStore.name, walletStore.address])

    const getCustomerList = async (vendorAddress: string, scriptAddress: string) => {
        const utxos = await lucid!.utxosAt(scriptAddress)
        const customers = await getVendorSubscriptions(lucid!, vendorAddress, utxos)
        setCustomerList(customers)
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
                                <p className="py-4 break-all max-w-fit">Connect your wallet to see your subscribers.</p>
                                <WalletConnect />
                                {/* <input type="text" onChange={(e) => { setVendorAddress(e.target.value) }} value={vendorAddress} placeholder="Enter vendor address" className="input input-bordered input-primary w-full max-w-xs" />
                                <button disabled={!vendorAddress.startsWith("addr")} className={`btn btn-primary`} onClick={() => { getCustomerList(vendorAddress, scriptAddress) }} >Search</button> */}
                                {walletStore.address && <VendorTable customerList={customerList} scriptAddress={scriptAddress} vendorAddress={vendorAddress} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VendorPage;