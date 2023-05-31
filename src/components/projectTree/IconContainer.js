export default function IconContainer({children, paddingLeft = 0}) {
    return <div
        className={'d-flex flex-row justify-content-center align-items-center custom-icon-container'}
        style={{paddingTop: 4, paddingLeft: paddingLeft}}
    >
        {children}
    </div>;
};
