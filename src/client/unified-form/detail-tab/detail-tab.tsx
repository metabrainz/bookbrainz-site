import AnnotationSection from '../../entity-editor/annotation-section/annotation-section';
import EditionSection from '../../entity-editor/edition-section/edition-section';
import React from 'react';


export function DetailTab(props) {
	return (
		<>
			<h2 className='mt-1'>What else do you know about the Book?</h2>
			<EditionSection {...props}/>
			<h2>Annotation</h2>
			<AnnotationSection {...props}/>
		</>);
}

export default DetailTab;
