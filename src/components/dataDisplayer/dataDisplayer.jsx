import "./dataDisplayer.css"

export default function DataDisplayer({text, value, ch}){

    return(
        <div className="dataDisplayer">
            <p>{text} :</p>
            <input type="text" value={value} readOnly = {(ch)? false : false} />
        </div>
    )
}