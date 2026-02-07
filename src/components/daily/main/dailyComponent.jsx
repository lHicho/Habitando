import "./dailyComponent.css"

export default function DailyComponent({ text, importance, value, onChange, onBlur, onKeyDown, inputRef }) {
    return (
        <div className="compo">
            <div className="compoText">
                <h1>{text}</h1>
                <p>{importance}</p>
            </div>
            <input
                ref={inputRef}
                type="number"
                min="0"
                max="100"
                value={value !== undefined ? value : ''}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
            />
        </div>
    )
}