function Icon({type, style, className=""}) {
  let allStyles = {
    //fontSize: '2rem',
    //color: 'red',
    ...(style || {}),
  };
  let bootstrapType = type || 'badge-3d';
  let allClassName = [`bi-${bootstrapType}`, className].join(" ");
  return (
    <i className={allClassName} style={allStyles}></i>
  );
}

function BackspaceIcon({style={}, className}) {
  return <Icon type="backspace" style={style} className={className}/>;
}
function PlayIcon({style={}, className}) {
  return <Icon type="play-btn-fill" style={style} className={className}/>;
}


export {
  Icon,
  BackspaceIcon,
  PlayIcon,
}
