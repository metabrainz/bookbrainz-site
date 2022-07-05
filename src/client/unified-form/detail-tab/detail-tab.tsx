import AnnotationSection from '../../entity-editor/annotation-section/annotation-section';
import EditionSection from '../../entity-editor/edition-section/edition-section';
import React from 'react';


export function DetailTab(props) {
	return (
		<div>
			<EditionSection {...props}/>
			<AnnotationSection {...props}/>
		</div>);
}

export default DetailTab;
