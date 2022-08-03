const SendIcon: React.FunctionComponent<{width: string, height: string}> = ({width, height}) => {
    return (
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
     width={height} height={height} viewBox="0 0 48.000000 48.000000"
    preserveAspectRatio="xMidYMid meet">
    <g transform="translate(0.000000,48.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
    <path d="M225 382 c-126 -44 -190 -72 -190 -81 0 -9 34 -25 97 -44 l97 -30 39
    -96 c23 -57 44 -96 52 -96 10 0 33 61 72 190 32 105 58 198 58 208 0 10 -7 17
    -17 16 -10 0 -103 -30 -208 -67z m79 -53 l-71 -71 -59 17 c-32 10 -62 20 -66
    24 -6 5 235 97 262 100 3 1 -27 -31 -66 -70z m66 -71 c-17 -56 -36 -118 -42
    -137 l-11 -35 -29 74 -29 73 67 68 c38 38 70 67 72 65 2 -2 -11 -51 -28 -108z"/>
    </g>
    </svg>
    )
}

export default SendIcon
