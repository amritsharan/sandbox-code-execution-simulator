"use client";

import type { SecurityAnalysisOutput } from '@/ai/flows/ai-security-analysis';
import {
  Activity,
  BrainCircuit,
  Cpu,
  Download,
  FileJson,
  LoaderCircle,
  MemoryStick,
  Play,
  Scaling,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Document, Packer, Paragraph } from 'docx';
import { jsPDF } from 'jspdf';
import policies from '@/lib/sandbox-policies.json';
import { cn } from '@/lib/utils';

const DEFAULT_CODE = `function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');`;

// Example of suspicious code for demonstration
const SUSPICIOUS_CODE_LOOP = `// This code will be flagged by the behavior-aware sandbox.
console.log("Starting a suspicious loop...");
while(true) {
  // This is a busy-wait loop that consumes CPU.
}
console.log("This will never be printed.");
`;

type BehaviorProfile = {
  syscallFrequency: 'Normal' | 'High' | 'Anomalous';
  memoryGrowth: 'Stable' | 'Linear' | 'Exponential';
  finalDecision: 'NORMAL' | 'INEFFICIENT' | 'MALICIOUS';
  detectedPattern: string | null;
};

export function Sandbox() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [cpu, setCpu] = useState([50]);
  const [memory, setMemory] = useState([256]);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<SecurityAnalysisOutput | null>(null);

  const [terminationReason, setTerminationReason] = useState<string | null>(
    null
  );
  const [behaviorProfile, setBehaviorProfile] =
    useState<BehaviorProfile | null>(null);

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

  const analyzeCodeBehavior = (codeToAnalyze: string): BehaviorProfile => {
    const { behavioralKeywords } = policies;
    let profile: BehaviorProfile = {
      syscallFrequency: 'Normal',
      memoryGrowth: 'Stable',
      finalDecision: 'NORMAL',
      detectedPattern: null,
    };

    if (
      policies.policies.detectInfiniteLoops &&
      behavioralKeywords.infiniteLoop.some((keyword) =>
        codeToAnalyze.includes(keyword)
      )
    ) {
      profile.syscallFrequency = 'High';
      profile.memoryGrowth = 'Stable';
      profile.finalDecision = 'MALICIOUS';
      profile.detectedPattern =
        'Potential infinite loop detected via static analysis.';
    } else if (
      policies.policies.detectForkBombs &&
      behavioralKeywords.forkBomb.some((keyword) =>
        codeToAnalyze.includes(keyword)
      )
    ) {
      profile.syscallFrequency = 'Anomalous';
      profile.memoryGrowth = 'Exponential';
      profile.finalDecision = 'MALICIOUS';
      profile.detectedPattern =
        'Potential fork bomb signature detected (e.g., fork() call).';
    } else if (
      policies.policies.detectHeapAbuse &&
      behavioralKeywords.heapAbuse.some((keyword) =>
        codeToAnalyze.includes(keyword)
      )
    ) {
      profile.memoryGrowth = 'Linear';
      profile.finalDecision = 'INEFFICIENT';
      profile.detectedPattern =
        'Potential inefficient memory usage (e.g., malloc in loop).';
    }

    return profile;
  };

  const handleRun = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTerminationReason(null);
    setBehaviorProfile(null);
    setOutput(['> Running pre-execution analysis...']);

    const result = await runSecurityAnalysis(code);

    setIsAnalyzing(false);
    setAnalysisResult(result);

    if (result.isSafe) {
      setOutput((prev) => [
        ...prev,
        '> Pre-execution analysis passed. Starting execution.',
        '> Starting runtime behavior analysis...',
      ]);

      const profile = analyzeCodeBehavior(code);
      setBehaviorProfile(profile);

      setIsRunning(true);

      let steps: string[];
      let terminate = false;
      let reason = '';

      switch (profile.finalDecision) {
        case 'MALICIOUS':
          setOutput((prev) => [
            ...prev,
            '> Runtime analysis detected: MALICIOUS BEHAVIOR.',
          ]);
          steps = [
            `> ${profile.detectedPattern}`,
            `> Monitoring resource usage...`,
            `> CPU usage spiking...`,
            `> System call frequency anomalous.`,
            `> Terminating process based on policy: [${profile.detectedPattern}]`,
          ];
          terminate = true;
          reason = `Terminated: ${profile.detectedPattern}`;
          break;
        case 'INEFFICIENT':
          setOutput((prev) => [
            ...prev,
            '> Runtime analysis detected: INEFFICIENT BEHAVIOR.',
          ]);
          steps = [
            `> ${profile.detectedPattern}`,
            `> System behavior is clean but inefficient.`,
            `> Applying adaptive resource constraints based on policy...`,
            `> Reducing memory limit by 20%.`,
            `Script finished with warnings.`,
          ];
          if (policies.policies.adaptiveLimits.enabled) {
            setMemory((prev) => [
              Math.floor(
                prev[0] * policies.policies.adaptiveLimits.inefficientBehaviorPenalty
              ),
            ]);
          }
          break;
        default: // NORMAL
          setOutput((prev) => [
            ...prev,
            '> Runtime analysis detected: NORMAL BEHAVIOR.',
          ]);
          steps = [
            'Process started with PID 42.',
            `Allocating ${memory[0]}MB memory...`,
            `CPU usage capped at ${cpu[0]}%.`,
            'Running script...',
            'Behavior is clean. Applying adaptive resource boost based on policy...',
            'CPU limit increased by 20%.',
            'Hello, World!',
            'Script finished.',
            'Process finished with exit code 0.',
          ];
          if (policies.policies.adaptiveLimits.enabled) {
            setCpu((prev) => [
              Math.min(
                100,
                Math.floor(prev[0] * policies.policies.adaptiveLimits.cleanBehaviorBoost)
              ),
            ]);
          }
          break;
      }

      let i = 0;
      simulationInterval.current = setInterval(() => {
        if (i < steps.length) {
          setOutput((prev) => [...prev, steps[i]]);
          i++;
        } else {
          if (terminate) {
            handleTerminate(false, reason);
          } else {
            handleTerminate(false); // Natural termination
          }
        }
      }, 750);
    } else {
      setOutput((prev) => [
        ...prev,
        `> Execution halted by pre-execution analysis.`,
      ]);
      setTerminationReason(result.reason);
    }
  };

  const handleTerminate = (
    userInitiated = true,
    reason: string | null = null
  ) => {
    clearSimulation();
    setIsRunning(false);
    if (userInitiated && !reason) {
      setOutput((prev) => [...prev, '> Process terminated by user.']);
      setTerminationReason('Process terminated manually by user.');
    }
    if (reason) {
      setTerminationReason(reason);
      setOutput((prev) => [...prev, `> ${reason}`]);
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
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="font-headline">Code Sandbox</CardTitle>
                <CardDescription>
                  Enter code to simulate execution in a behavior-aware sandbox.
                </CardDescription>
              </div>
              {isAnalyzing && (
                <Badge variant="secondary">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </Badge>
              )}
              {analysisResult && !isAnalyzing && (
                <Badge
                  variant={analysisResult.isSafe ? 'default' : 'destructive'}
                >
                  {analysisResult.isSafe ? (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <ShieldAlert className="mr-2 h-4 w-4" />
                  )}
                  {analysisResult.isSafe
                    ? 'Pre-analysis: Safe'
                    : 'Pre-analysis: Threat Detected'}
                </Badge>
              )}
            </div>
            {analysisResult && !analysisResult.isSafe && (
              <Alert variant="destructive" className="mt-4">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Security Analysis</AlertTitle>
                <AlertDescription>{analysisResult.reason}</AlertDescription>
              </Alert>
            )}
            {terminationReason && (
              <Alert variant="destructive" className="mt-4">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Execution Terminated</AlertTitle>
                <AlertDescription>{terminationReason}</AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor">
              <TabsList className="mb-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="policy">Policy Engine</TabsTrigger>
              </TabsList>
              <TabsContent value="editor">
                <div className="relative">
                  <Textarea
                    placeholder="Enter your code here..."
                    className="min-h-[350px] font-code text-sm"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isRunning || isAnalyzing}
                  />
                  <Button
                    variant="link"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => setCode(SUSPICIOUS_CODE_LOOP)}
                  >
                    Load suspicious code example
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="policy">
                <div className="min-h-[350px] rounded-md border bg-muted/30 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold">
                    <FileJson /> sandbox-policies.json
                  </h4>
                  <ScrollArea className="h-[300px]">
                    <pre className="whitespace-pre-wrap text-xs font-code text-foreground">
                      {JSON.stringify(policies, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
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
        {behaviorProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5" />
                Runtime Behavior Analysis
              </CardTitle>
              <CardDescription>
                The sandbox analyzes execution patterns, not just static code.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Activity /> Syscall Frequency
                </span>
                <Badge
                  variant={
                    behaviorProfile.syscallFrequency === 'Normal'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {behaviorProfile.syscallFrequency}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Scaling /> Memory Growth
                </span>
                <Badge
                  variant={
                    behaviorProfile.memoryGrowth === 'Stable'
                      ? 'secondary'
                      : 'default'
                  }
                >
                  {behaviorProfile.memoryGrowth}
                </Badge>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-muted-foreground">
                  Final Classification
                </span>
                <span
                  className={cn(
                    'font-bold',
                    behaviorProfile.finalDecision === 'MALICIOUS' &&
                      'text-destructive',
                    behaviorProfile.finalDecision === 'INEFFICIENT' &&
                      'text-yellow-500',
                    behaviorProfile.finalDecision === 'NORMAL' && 'text-primary'
                  )}
                >
                  {behaviorProfile.finalDecision}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Configuration</CardTitle>
            <CardDescription>
              Set initial resource limits. Limits may adapt based on behavior.
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
                <MemoryStick className="mr-2 h-4 w-4" /> Memory Limit (
                {memory[0]} MB)
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

        <Card className="flex flex-grow flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <Terminal className="mr-2 h-5 w-5" />
              Real-time Output
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <ScrollArea className="h-[250px] w-full rounded-md border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap text-xs font-code text-foreground">
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
