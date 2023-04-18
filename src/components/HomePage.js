import SyntaxHighlighter from "react-syntax-highlighter";
import * as themes from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function HomePage() {

    console.log(Object.keys(themes).sort()[0]);

    let text = `
    @Annotation
    public class SpringApiApplication {
    
        static {
            System.out.println("Hello \\n world");
        }
    
        public static void main(String[] args) {
            SpringApplication.run(SpringApiApplication.class, args);
        }
    }
    `;text='';

    return (
        <div>
            <SyntaxHighlighter
                language={'java'}
                style={themes['github']}
                showLineNumbers
            >
                {text}
            </SyntaxHighlighter>
        </div>
    );
};
