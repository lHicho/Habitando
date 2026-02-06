import { Fa0 } from "react-icons/fa6"
import { Fa1 } from "react-icons/fa6"
import { Fa2 } from "react-icons/fa6"
import { Fa3 } from "react-icons/fa6"
import { Fa4 } from "react-icons/fa6"
import { Fa5 } from "react-icons/fa6"
import { Fa6 } from "react-icons/fa6"
import { Fa7 } from "react-icons/fa6"
import { Fa8 } from "react-icons/fa6"
import { Fa9 } from "react-icons/fa6"

import { FaGamepad } from "react-icons/fa6";
import { FaPersonPraying } from "react-icons/fa6";
import { IoIosFootball } from "react-icons/io";
import { FaPaintbrush } from "react-icons/fa6";
import { FaCode } from "react-icons/fa";
import { FaTooth } from "react-icons/fa6";
import { FaTshirt } from "react-icons/fa";
import { FaBatteryFull } from "react-icons/fa6";
import { GiNightSleep } from "react-icons/gi";
import { GoHomeFill } from "react-icons/go";
import { FaBook } from "react-icons/fa";
import { FaDog } from "react-icons/fa6";
import { FaBookOpenReader } from "react-icons/fa6";
import { FaMoneyBill } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";
import { FaStarAndCrescent } from "react-icons/fa6";

export default function IconGenerator({ icon }) {
    if (icon == "0") {
        return <Fa0 />
    } else if (icon == "1") {
        return <Fa1 />
    } else if (icon == "2") {
        return <Fa2 />
    } else if (icon == "3") {
        return <Fa3 />
    } else if (icon == "4") {
        return <Fa4 />
    } else if (icon == "5") {
        return <Fa5 />
    } else if (icon == "6") {
        return <Fa6 />
    } else if (icon == "7") {
        return <Fa7 />
    } else if (icon == "8") {
        return <Fa8 />
    } else if (icon == "9") {
        return <Fa9 />
    } else if (icon == "gamepad" || icon == "10") {
        return <FaGamepad />
    } else if (icon == "praying" || icon == "11") {
        return <FaPersonPraying />
    } else if (icon == "football" || icon == "12") {
        return <IoIosFootball />
    } else if (icon == "paintbrush" || icon == "13") {
        return <FaPaintbrush />
    } else if (icon == "code" || icon == "14") {
        return <FaCode />
    } else if (icon == "tooth" || icon == "15") {
        return <FaTooth />
    } else if (icon == "tshirt" || icon == "16") {
        return <FaTshirt />
    } else if (icon == "battery" || icon == "17") {
        return <FaBatteryFull />
    } else if (icon == "sleep" || icon == "18") {
        return <GiNightSleep />
    } else if (icon == "home" || icon == "19") {
        return <GoHomeFill />
    } else if (icon == "book" || icon == "20") {
        return <FaBook />
    } else if (icon == "dog" || icon == "21") {
        return <FaDog />
    } else if (icon == "reader" || icon == "22") {
        return <FaBookOpenReader />
    } else if (icon == "money" || icon == "23") {
        return <FaMoneyBill />
    } else if (icon == "star" || icon == "24") {
        return <FaStar />
    } else if (icon == "starAndCrescent" || icon == "25") {
        return <FaStarAndCrescent />
    } else {
        return null
    }
}