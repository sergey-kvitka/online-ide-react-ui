import TreeView from "@mui/lab/TreeView";
import {ChevronRight, CopyrightTwoTone, ExpandMore, FolderRounded, FolderSpecial} from "@mui/icons-material";
import {TreeItem} from "@mui/lab";
import ProjectTreeElement from "./ProjectTreeElement";
import IconContainer from "./IconContainer";

export default function ProjectTree({tree, ids, projectInfo, documentIdSetter, selected, fileUpdateHandler, projectRole}) {

    const projectName = projectInfo['name'];

    const icons = {
        'root': <FolderSpecial style={{color: '#0c01a6'}}/>,
        'collapse': <ExpandMore style={{color: '#0b00c9'}}/>,
        'expand': <ChevronRight/>,
        'folder': <FolderRounded style={{color: '#565656'}}/>,
        'java': <CopyrightTwoTone style={{color: '#ffffff', backgroundColor: '#dc8f00', borderRadius: '50%'}}/>
    };

    const getChildren = (tree, projectInfo) => {
        let children = [];
        for (let key in tree) {
            let child = tree[key];
            if ((Object.prototype.toString.call(child).slice(8, -1).toLowerCase()) !== 'object') continue;
            children.push(<ProjectTreeElement
                tree={child}
                key={key}
                projectInfo={projectInfo}
                childrenGetter={getChildren}
                icons={icons}
                documentIdSetter={documentIdSetter}
                selected={selected}
                fileUpdateHandler={fileUpdateHandler}
                projectRole={projectRole}
            />);
        }
        return children;
    };

    return <TreeView
        className={'custom-project-tree'}
        style={{width: 'fit-content'}}
        defaultCollapseIcon={
            <IconContainer>
                {icons['collapse']}
                {icons['folder']}
            </IconContainer>
        }
        defaultExpandIcon={
            <IconContainer>
                {icons['expand']}
                {icons['folder']}
            </IconContainer>
        }
        defaultExpanded={[...ids.map(id => `${id}`), projectName]}
    >
        <TreeItem
            label={<p className={'no-margin no-pad'} style={{whiteSpace: "nowrap"}}>{projectName}</p>}
            nodeId={projectName}
            key={projectName}
            className={'project-tree-element'}
            collapseIcon={
                <IconContainer>
                    {icons['collapse']}
                    {icons['root']}
                </IconContainer>
            }
            expandIcon={
                <IconContainer>
                    {icons['expand']}
                    {icons['root']}
                </IconContainer>
            }
        >
            {getChildren(tree, projectInfo)}
        </TreeItem>
    </TreeView>;
};
