import {Links, Meta, Outlet, Scripts, ScrollRestoration} from 'react-router';
import React from 'react';


export function Layout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8"/>
				<Meta/>
				<Links/>
			</head>
			<body>
				{children}
				<ScrollRestoration/>
				<Scripts/>
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet/>;
}
