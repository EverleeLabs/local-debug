import React from "react";

const TestPanel = (props) => {
	return (
		<div style={{ flex: "1", overflowY: "auto", margin: "10px", padding: "24px" }}>
			<h2>WP Debug Toggler</h2>
			<p>Site: {props.site?.name || 'Unknown'}</p>
		</div>
	);
};

export default TestPanel;

