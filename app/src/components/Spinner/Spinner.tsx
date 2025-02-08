export function Spinner() {
    return (
        <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient
                    id="spinner-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                >
                    <stop
                        offset="0%"
                        style={{ stopColor: '#3498db', stopOpacity: 1 }}
                    />
                    <stop
                        offset="100%"
                        style={{ stopColor: '#e74c3c', stopOpacity: 1 }}
                    />
                </linearGradient>
            </defs>
            <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="5"
                stroke="url(#spinner-gradient)"
                strokeLinecap="round"
            >
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    dur="1s"
                    from="0 25 25"
                    to="360 25 25"
                    repeatCount="indefinite"
                />
            </circle>
        </svg>
    )
}
