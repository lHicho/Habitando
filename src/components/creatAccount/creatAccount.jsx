import "./creatAccount.css"

import { useState } from "react"
import { useUser } from '../../context/userContext'
import { Link, useNavigate } from "react-router-dom"

import { FaRegUserCircle } from "react-icons/fa"
import { MdAlternateEmail } from "react-icons/md"
import { RiLockPasswordLine } from "react-icons/ri"
import { toast } from "react-hot-toast"

export default function CreatAccount() {

    const { addUser, updateInfo } = useUser()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        date: '',
        password: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.password.length < 8) {
            toast.error("Password should be at least 8.")
        } else {
            const respnce = await addUser(formData)
            if (respnce == 100) {
                toast.error("E-mail allready used.")
            } else if (respnce == 200) {
                toast.success("Account created succesfully.")
                updateInfo(formData.email)
                navigate('/')
            }
        }
    }

    return (
        <div className="creatAccount">
            <h1>Hi There, Creat Your Account.</h1>

            <form onSubmit={handleSubmit}>
                <h2>Creat New Account</h2>

                <div className="inputCont">
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="User Name"
                        required
                    />
                    <FaRegUserCircle />
                </div>

                <div className="inputCont">
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="E-mail"
                        required
                    />
                    <MdAlternateEmail />
                </div>

                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="Date of birth"
                    required
                />

                <div className="inputCont">
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="PassWord"
                        required
                    />
                    <RiLockPasswordLine />
                </div>
                <p>If you allready have an accout, then sign in <Link to="/signin">Here</Link>.</p>
                <button type="submit">Submit</button>

            </form>

        </div>
    )
}
