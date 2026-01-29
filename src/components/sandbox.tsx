"use client";

import type { SecurityAnalysisOutput } from '@/ai/flows/ai-security-analysis';
import {
  Cpu,
  Download,
  LoaderCircle,
  MemoryStick,
  Play,
  ShieldAlert,
  ShieldCheck,
  StopCircle,
  Terminal,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { runSecurityAnalysis } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph } from 'docx';

const DEFAULT_CODE = `function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');`;

export function Sandbox() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [cpu, setCpu] = useState([50]);
  const [memory, setMemory] = useState([256]);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<SecurityAnalysisOutput | null>(null);

  const { toast } = useToast();
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const clearSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
  };

  const handleRun = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setOutput(['> Running security analysis...']);

    const result = await runSecurityAnalysis(code);

    setIsAnalyzing(false);
    setAnalysisResult(result);

    if (result.isSafe) {
      setOutput((prev) => [
        ...prev,
        '> Starting execution...',
      ]);
      setIsRunning(true);

      const mockOutput = [
        'Process started with PID 42.',
        `Allocating ${memory[0]}MB memory...`,
        `CPU usage capped at ${cpu[0]}%.`,
        'Running script...',
        'Hello, World!',
        'Script finished.',
        'Process finished with exit code 0.',
      ];

      let i = 0;
      simulationInterval.current = setInterval(() => {
        if (i < mockOutput.length) {
          setOutput((prev) => [...prev, mockOutput[i]]);
          i++;
        } else {
          handleTerminate(false); // Natural termination
        }
      }, 750);
    } else {
      setOutput((prev) => [
        ...prev,
        `> Execution halted.`,
      ]);
      toast({
        variant: 'destructive',
        title: 'Execution Halted',
        description: 'A potential security threat was detected.',
      });
    }
  };

  const handleTerminate = (userInitiated = true) => {
    clearSimulation();
    setIsRunning(false);
    if (userInitiated) {
      setOutput((prev) => [...prev, '> Process terminated by user.']);
    }
  };

  const handleDownload = (format: 'PDF' | 'Word') => {
    const fileContent = output.join('\n');

    if (format === 'PDF') {
      try {
        const doc = new jsPDF();
        doc.setFont('courier');
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(fileContent, 180);
        doc.text(lines, 10, 10);
        doc.save('sandbox-output.pdf');

        toast({
          title: 'Download Started',
          description: 'Your PDF file is downloading.',
        });
      } catch (e) {
        console.error('Failed to generate PDF:', e);
        toast({
          variant: 'destructive',
          title: 'PDF Generation Failed',
          description: 'There was an error creating the PDF file.',
        });
      }
    } else {
      try {
        const doc = new Document({
          sections: [
            {
              children: output.map(
                (line) =>
                  new Paragraph({
                    text: line,
                    style: 'normal',
                  })
              ),
            },
          ],
          styles: {
            paragraphStyles: [
              {
                id: 'normal',
                name: 'Normal',
                basedOn: 'Normal',
                next: 'Normal',
                run: {
                  font: 'Courier New',
                  size: 20, // 10pt
                },
              },
            ],
          },
        });

        Packer.toBlob(doc).then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'sandbox-output.docx';

          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          toast({
            title: 'Download Started',
            description: 'Your Word file is downloading.',
          });
        });
      } catch (e) {
        console.error('Failed to generate DOCX:', e);
        toast({
          variant: 'destructive',
          title: 'Word Generation Failed',
          description: 'There was an error creating the Word file.',
        });
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearSimulation();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="font-headline">Code Editor</CardTitle>
              <CardDescription>
                Enter code to simulate execution.
              </CardDescription>
            </div>
            {isAnalyzing && (
              <Badge variant="secondary">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </Badge>
            )}
            {analysisResult && !isAnalyzing && (
              <Badge variant={analysisResult.isSafe ? 'default' : 'destructive'}>
                {analysisResult.isSafe ? (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                ) : (
                  <ShieldAlert className="mr-2 h-4 w-4" />
                )}
                {analysisResult.isSafe ? 'Safe' : 'Threat Detected'}
              </Badge>
            )}
          </div>
          {analysisResult && !analysisResult.isSafe && (
            <Alert variant="destructive" className="mt-4">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Analysis Explanation</AlertTitle>
              <AlertDescription>{analysisResult.reason}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              placeholder="Enter your code here..."
              className="min-h-[400px] font-code text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isRunning || isAnalyzing}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button onClick={handleRun} disabled={isRunning || isAnalyzing}>
            {isAnalyzing ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleTerminate(true)}
            disabled={!isRunning}
          >
            <StopCircle className="mr-2 h-4 w-4" />
            Terminate
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Configuration</CardTitle>
            <CardDescription>
              Set resource limits for the sandbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-3">
              <Label
                htmlFor="cpu-limit"
                className="flex items-center text-sm"
              >
                <Cpu className="mr-2 h-4 w-4" /> CPU Limit ({cpu[0]}%)
              </Label>
              <Slider
                id="cpu-limit"
                min={10}
                max={100}
                step={10}
                value={cpu}
                onValueChange={setCpu}
                disabled={isRunning || isAnalyzing}
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="memory-limit"
                className="flex items-center text-sm"
              >
                <MemoryStick className="mr-2 h-4 w-4" /> Memory Limit ({memory[0]} MB)
              </Label>
              <Slider
                id="memory-limit"
                min={64}
                max={1024}
                step={64}
                value={memory}
                onValueChange={setMemory}
                disabled={isRunning || isAnalyzing}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <Terminal className="mr-2 h-5 w-5" />
              Real-time Output
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <ScrollArea className="h-[250px] w-full rounded-md border bg-muted/30 p-4">
              <pre className="text-xs font-code text-foreground whitespace-pre-wrap">
                {output.join('\n')}
                {isRunning && (
                  <span className="ml-1 inline-block h-3 w-2 animate-pulse bg-primary align-middle" />
                )}
              </pre>
              <div ref={outputEndRef} />
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleDownload('PDF')}
              disabled={!output.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownload('Word')}
              disabled={!output.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Word
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
