import "./signIn.css"

import { useUser } from "../../context/userContext"
import { useSidebar } from "../../context/sideContext" 
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

import { MdAlternateEmail } from "react-icons/md"
import { RiLockPasswordLine } from "react-icons/ri"

export default function SignIn() {

    const { signIn, updateInfo } = useUser()
    const { stayFunc } = useSidebar()
    const navigate = useNavigate()

    const [signData, setSignData] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setSignData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (signData.email == "" || signData.password == "") {
            toast.error("Please fill bothe fields.")
        } else {
            if (signData.password.length < 8) {
                toast.error("Password should be at least 8.")
            } else {
                const respnce = await signIn(signData.email, signData.password)
                if (respnce == 100) {
                    toast.error("User e-mail not found.")
                } else if (respnce == 200) {
                    updateInfo(signData.email)
                    toast.success("Signed in succesfully")
                    stayFunc()
                    navigate('/')
                } else if (respnce == 300) {
                    toast.error("Password is not correct, try again.")

                }
            }

        }

    }

    return (
        <div className="signIn">
            <h1>Welcome Back, Sign In To Your Account</h1>

            <form onSubmit={handleSubmit}>
                <h2>Sign In</h2>
                <div className="inputCont">
                    <input
                        type="email"
                        name="email"
                        value={signData.email}
                        onChange={handleChange}
                        placeholder="E-mail"
                        required
                    />
                    <MdAlternateEmail />
                </div>

                <div className="inputCont">
                    <input
                        type="password"
                        name="password"
                        value={signData.password}
                        onChange={handleChange}
                        placeholder="PassWord"
                        required
                    />
                    <RiLockPasswordLine />
                </div>

                <p>If you don't have an account yet creat one <Link to="/regester">Here</Link>.</p>

                <button type="submit">Sign In</button>
            </form>
        </div>
    )
}