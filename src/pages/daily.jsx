import DailySide from "../components/daily/side/dailySide.jsx"
import DailyHead from "../components/daily/header/dailyHead.jsx"
import DailyMain from "../components/daily/main/dailyMain.jsx"

export default function Daily() {
    return(
        <div className="dialy">
            <DailyHead/>
            <DailySide />
            <DailyMain />
        </div>
    )
}