

import { useState, useEffect } from 'react'
// table where the customer can see his active subscriptions
const MessageModal = (props: any) => {
    const title = props.title;
    const message = props.message;
    const [active, setActive] = useState<boolean>(props.active);
    useEffect(()=>{
        setActive(props.active)
    },[props.active])
    return (
        <>
            <input checked={active} type="checkbox" id="my-modal-3" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box relative">
                    <label htmlFor="my-modal-3" className="btn btn-sm btn-circle absolute right-2 top-2" onClick={()=>{setActive(false)}}>✕</label>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="py-4">{message}</p>
                </div>
            </div>
        </>
    )
}

export default MessageModal;