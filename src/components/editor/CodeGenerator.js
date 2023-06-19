// noinspection JSCheckFunctionSignatures

import Methods from "../../util/Methods";
import Constants from "../../util/Constants";
import {
    Button,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@mui/material";
import {useState} from "react";
import {v4 as uuid} from 'uuid';
import FieldCodeGen from "./FieldCodeGen";

// const MATCH_GENERIC = /<([^)]+)>/;

export default function CodeGenerator({fileName, codeGenerateHandler}) {
    let type;
    if (fileName.endsWith('.java')) type = 'java';
    else if (fileName.endsWith('/pom.xml') || fileName === 'pom.xml') type = 'pom';

    // noinspection JSIncompatibleTypesComparison
    const isJava = (type === 'java');
    const packagePath = fileName.split('/').slice(0, -1).join('.').replace('src.main.java.', '');

    const classNameFromFile = isJava ? fileName.slice(0, -5).split('/').at(-1) : null;

    // const [className, setClassName] = useState(isJava ? classNameFromFile : '');

    const [classDefinition, setClassDefinition] = useState(`public class ${classNameFromFile}`);
    const [createMain, setCreateMain] = useState(false);
    const [sample, setSample] = useState(false);
    const [createEqualsAndHashCode, setCreateEqualsAndHashCode] = useState(false);
    const [createConstructor, setCreateConstructor] = useState(false);
    const [createGetters, setCreateGetters] = useState(false);
    const [createSetters, setCreateSetters] = useState(false);
    const [builderLike, setBuilderLike] = useState(false);
    const [createToString, setCreateToString] = useState(false);

    const [fields, setFields] = useState([emptyField()]);

    const [replaceExistingCode, setReplaceExistingCode] = useState(false);

    const changeFieldHandler = field => {
        setFields(prev => {
            const newPrev = [...prev];
            const index = newPrev.findIndex(f => f['id'] === field['id']);
            let fieldFromPrev = newPrev[index];
            fieldFromPrev['modifiers'] = field['modifiers'];
            fieldFromPrev['type'] = field['type'];
            fieldFromPrev['generic'] = field['generic'];
            fieldFromPrev['name'] = field['name'];
            fieldFromPrev['default'] = field['default'];
            return newPrev;
        });
    }

    const deleteFieldHandler = fieldId => {
        setFields(prev => [...prev].filter(f => f['id'] !== fieldId));
    }

    const addFieldHandler = () => {
        setFields(prev => [...prev, emptyField()]);
    }

    const handleJavaCodeGeneration = (isOk) => {
        if (!isOk) {
            codeGenerateHandler(null);
            return;
        }
        let classSignature = ' ' + classDefinition + ' ';
        classSignature = classSignature.replaceAll('<', ' < ');
        classSignature = classSignature.replaceAll('>', ' > ');
        classSignature = classSignature.replaceAll('<', ' < ');
        classSignature = classSignature.replaceAll('>', ' > ');
        const classSignatureModifiersAndKeywords = ['abstract', 'enum', 'final', 'private',
            'public', 'protected', 'record', 'static', 'class', '@interface', 'interface'];
        classSignatureModifiersAndKeywords.forEach(keyword => {
            classSignature = classSignature.replaceAll(' ' + keyword + ' ', ' ');
        });
        classSignature = classSignature.trim();
        const className = classSignature === '' ? '' : classSignature.split(' ')[0];
        let genericName = '';
        genericCheck: {
            if (classSignature === '') break genericCheck;
            classSignature = classSignature.replace(className, '');
            classSignature = classSignature.trim();
            if (classSignature === '') break genericCheck;
            let from = 0;
            if (classSignature.charAt(from) !== '<') break genericCheck;
            let classSignatureLength = classSignature.length;
            let to = 1;
            let bracketCounter = 1;
            for (; bracketCounter !== 0 && to < classSignatureLength; to++) {
                let char = classSignature.charAt(to);
                switch (char) {
                    case '<': {
                        bracketCounter++;
                        break;
                    }
                    case '>': {
                        bracketCounter--;
                    }
                }
            }
            if (bracketCounter !== 0) break genericCheck;
            let insideBrackets = classSignature.slice(from + 1, to - 1);
            genericName = insideBrackets.split('extends')[0].trim();
        }
        const options = {
            'fields': [...fields]
                .map(field => ({
                    'type': field['type'].trim(),
                    'name': field['name'].trim(),
                    'generic': field['generic'].trim(),
                    'default': field['default'].trim(),
                    'modifiers': field['modifiers'].trim(),
                }))
                .filter(field => field['type'] !== '' && field['name'] !== ''),
            'className': className,
            'genericName': genericName,
            'package': packagePath,
            'classSignature': classDefinition.trim(),
            'createEqualsAndHashCode': createEqualsAndHashCode,
            'createMain': createMain,
            'sample': sample,
            'createConstructor': createConstructor,
            'createGetters': createGetters,
            'createSetters': createSetters,
            'builderLike': builderLike,
            'createToString': createToString
        }
        codeGenerateHandler({'replace': replaceExistingCode, 'code': generateJavaCode(options), 'source': 'codeGen'});
    }

    return {
        'java': <>
            <Typography variant={'h3'} style={{marginBottom: 10}}>Создание Java-класса</Typography>
            <div style={{padding: '15px 10px 10px', border: '1px solid #666666', borderRadius: 10, width: '75%'}}>
                <TextField
                    label={'Описание класса'}
                    fullWidth
                    sx={{
                        '.MuiInputBase-input': {fontSize: 20, fontFamily: 'Consolas, "Courier New", monospace'},
                        '.MuiInputAdornment-positionEnd *': {fontSize: 20, fontFamily: 'Consolas, "Courier New", monospace'}
                    }}
                    value={classDefinition}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment style={{marginRight: 15}} position="end">{'{'}</InputAdornment>
                        ),
                    }}
                    onChange={event => setClassDefinition(event.target.value)}
                />
            </div>
            <div style={{padding: '10px 20px', border: '1px solid #666666', borderRadius: 10, width: '75%'}}>
                <Typography variant={'h5'}>Главный класс</Typography>
                <FormControlLabel
                    sx={{'.MuiFormControlLabel-label': {fontSize: 20}}}
                    control={
                        <Checkbox
                            checked={createMain}
                            onChange={event => {
                                const checked = event.target.checked;
                                if (!checked) setSample(false);
                                setCreateMain(checked);
                            }}
                        />
                    }
                    label="Создать метод main"/><br/>
                <FormControlLabel
                    disabled={!createMain}
                    sx={{'.MuiFormControlLabel-label': {fontSize: 20}, marginLeft: '20px'}}
                    control={
                        <Checkbox
                            checked={sample}
                            onChange={event => setSample(event.target.checked)}
                        />
                    }
                    label={'Добавить вывод "Hello World"'}/>
            </div>
            <div style={{padding: '10px 20px', border: '1px solid #666666', borderRadius: 10, width: '75%'}}>
                <Typography variant={'h5'}>Поля класса</Typography>
                {
                    fields.map(f =>
                        <FieldCodeGen
                            key={f['id']}
                            field={f}
                            addHandler={addFieldHandler}
                            deleteHandler={deleteFieldHandler}
                            changeHandler={changeFieldHandler}
                        />)
                }
                <div className={'d-flex flex-row justify-content-around'}>
                    <div style={{width: '45%'}}>
                        <FormControlLabel
                            sx={{'.MuiFormControlLabel-label': {fontSize: 20}, marginLeft: '20px'}}
                            control={
                                <Checkbox
                                    checked={createConstructor}
                                    onChange={event => setCreateConstructor(event.target.checked)}
                                />
                            }
                            label={'Создать конструктор'}/>
                    </div>
                    <div style={{width: '45%'}}>
                        <FormControlLabel
                            sx={{'.MuiFormControlLabel-label': {fontSize: 20}, marginLeft: '20px'}}
                            control={
                                <Checkbox
                                    checked={createGetters}
                                    onChange={event => setCreateGetters(event.target.checked)}
                                />
                            }
                            label={'Создать геттеры'}/>
                    </div>
                </div>
                <div className={'d-flex flex-row justify-content-around'}>
                    <div style={{width: '45%'}}>
                        <FormControlLabel
                            sx={{'.MuiFormControlLabel-label': {fontSize: 20}, marginLeft: '20px'}}
                            control={
                                <Checkbox
                                    checked={createToString}
                                    onChange={event => setCreateToString(event.target.checked)}
                                />
                            }
                            label={'Создать метод toString'}/>
                    </div>
                    <div style={{width: '45%'}}>
                        <FormControlLabel
                            sx={{'.MuiFormControlLabel-label': {fontSize: 20}, marginLeft: '20px'}}
                            control={
                                <Checkbox
                                    checked={createEqualsAndHashCode}
                                    onChange={event => setCreateEqualsAndHashCode(event.target.checked)}
                                />
                            }
                            label={'Создать equals & hashCode'}/>
                    </div>
                </div>
                <div
                    className={'d-flex flex-row justify-content-around'}
                    style={{padding: '5px 0', border: '1px solid #666666', borderRadius: 10}}
                >
                    <div style={{width: '45%'}}>
                        <FormControlLabel
                            sx={{'.MuiFormControlLabel-label': {fontSize: 20}, marginLeft: '20px'}}
                            control={
                                <Checkbox
                                    checked={createSetters}
                                    onChange={event => {
                                        const checked = event.target.checked;
                                        if (!checked) setBuilderLike(false);
                                        setCreateSetters(checked);
                                    }}
                                />
                            }
                            label={'Создать сеттеры'}/>
                    </div>
                    <div style={{width: '45%'}}>
                        <FormControlLabel
                            disabled={!createSetters}
                            sx={{'.MuiFormControlLabel-label': {fontSize: 20}, marginLeft: '20px'}}
                            control={
                                <Checkbox
                                    checked={builderLike}
                                    onChange={event => setBuilderLike(event.target.checked)}
                                />
                            }
                            label={'По шаблону Builder'}/>
                    </div>
                </div>
            </div>
            <RadioGroup
                className={'w-50 d-flex flex-row justify-content-around'}
                value={replaceExistingCode}
                onChange={event => setReplaceExistingCode(event.target.value)}
            >
                <FormControlLabel
                    sx={{'.MuiFormControlLabel-label': {fontSize: 20}}}
                    value={false}
                    control={<Radio/>}
                    label="Добавить код"
                />
                <FormControlLabel
                    sx={{'.MuiFormControlLabel-label': {fontSize: 20}}}
                    value={true}
                    control={<Radio/>}
                    label="Заменить существующий"
                />
            </RadioGroup>
            <div className={'d-flex flex-row justify-content-around w-50'}>
                <Button
                    variant={'contained'}
                    type={'button'}
                    size={'large'}
                    color={"error"}
                    onClick={() => {
                        handleJavaCodeGeneration(false);
                    }}
                >
                    Отменить
                </Button>
                <Button
                    variant={'contained'}
                    type={'button'}
                    size={'large'}
                    onClick={() => {
                        handleJavaCodeGeneration(true);
                    }}
                >
                    Сгенерировать код
                </Button>
            </div>
        </>,
        'pom': <>
        </>
    }[type];
};

function emptyField() {
    return {'id': uuid(), 'modifiers': '', 'type': '', 'generic': '', 'name': '', 'default': ''};
}

function generateJavaCode(options) {

    const fields = [...options['fields']];
    const className = options['className'];
    const genericName = options['genericName'];
    const createEqualsAndHashCode = options['createEqualsAndHashCode'];

    const nonStaticFields = fields.filter(f => f['modifiers'] && !f['modifiers'].includes('static'));

    const parts = [];
    parts.push('\n' + createFieldList(fields));
    if (options['createMain']) parts.push(createMainMethod(options['sample']));
    if (options['createConstructor']) parts.push(createConstructor(nonStaticFields, className));
    if (options['createGetters']) parts.push(fields.map(f => createGetter(f)).join('\n'));
    if (options['createSetters']) {
        parts.push(nonStaticFields
            .filter(f => f['modifiers'].includes('final'))
            .map(f => createSetter(f, options['builderLike'], className, genericName)).join('\n'));
    }
    if (options['createToString']) parts.push(createToString(nonStaticFields, className));
    if (createEqualsAndHashCode) {
        parts.push(createEquals(nonStaticFields, className, genericName !== ''));
        parts.push(createHashCode(nonStaticFields));
    }

    return `package ${options['package']};
${createEqualsAndHashCode ? '\nimport java.util.Objects;\n' : ''}
${options['classSignature']} {
${parts.join('\n')}
}`;
}

const createMainMethod = sample => {
    return `    public static void main(String[] args) {\n        ${
        sample ? 'System.out.println("Hello, World!");' : ''
    }\n    }\n`;
};

const createFieldList = fields => {
    if (fields.length === 0) return '';
    return fields.map(f => `    ${
        f['modifiers']
    } ${
        f['type']
    }${
        f['generic']
    } ${
        f['name']
    }${
        (f['default'] !== '') ? ` = ${f['default']}` : ''
    };`).join('\n') + '\n';
}

const createConstructor = (fields, className) => {
    const constructorArgs = fields.map(f => `${f['type']}${f['generic']} ${f['name']}`).join(', ');
    const constructorBody = fields.map(f => {
        const name = f['name'];
        return `        this.${name} = ${name};`;
    }).join('\n');
    return `    public ${className}(${constructorArgs}) {\n${constructorBody}\n    }\n`;
};

const createSetter = (field, builderLike, className, genericName) => {
    const fieldName = field['name'];
    return `    public ${builderLike
        ? `${className}${genericName === '' ? '' : `<${genericName}>`}`
        : 'void'} set${Methods.capitalize(fieldName)}(${field['type']}${field['generic']} ${fieldName}) {
        this.${fieldName} = ${fieldName};${builderLike ? '\n        return this;' : ''}\n    }\n`;
};

const createGetter = field => {
    const fieldName = field['name'];
    return `    public ${field['type']}${field['generic']} get${Methods.capitalize(fieldName)}() {\n`
        + `        return ${fieldName};\n    }\n`;
};

const createToString = (fields, className) => {
    if (fields.length === 0) {
        return `    @Override\n    public String toString() {\n        return "${className}{}";\n    }\n`;
    }
    const toStringBody = fields.map(f => {
        const name = f['name']
        return `${name}=${(f['type'] === 'String') ? `'" + ${name} + '\\''` : `" + ${name}`} +`;
    }).join('\n                ", ');
    return `    @Override\n    public String toString() {\n        return "${className}{" +`
        + `\n                "${toStringBody}\n                '}';\n    }\n`;
};

const createEquals = (fields, className, hasGeneric) => {
    if (fields.length === 0) return '';
    const oName = Methods.uncapitalize(className);
    const comparison = fields.map(f => {
        const name = f['name'];
        const parts = (Constants.JAVA_PRIMITIVES.includes(f['type']))
            ? ['', ' == ', '']
            : ['Objects.equals(', ', ', ')'];
        return `${parts[0]}${name}${parts[1]}${oName}.${name}${parts[2]}`;
    }).join(' && ');
    return `    @Override\n    public boolean equals(Object o) {\n        if (this == o) return true;\n        `
        + `if (o == null || getClass() != o.getClass()) return false;\n        `
        + `${className}${hasGeneric ? '<?>' : ''} ${oName} = (${className}${hasGeneric ? '<?>' : ''}) o;\n        `
        + `return ${comparison};\n    }\n`;
};

const createHashCode = fields => {
    if (fields.length === 0) return '';
    return `    @Override\n    public int hashCode() {\n        return Objects.hash(${
        fields.map(f => f['name']).join(', ')
    });\n    }\n`;
};
