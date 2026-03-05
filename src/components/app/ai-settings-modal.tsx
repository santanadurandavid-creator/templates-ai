'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useAppSettings } from '@/hooks/use-app-settings';
import { Key, Sparkles, Save, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AISettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MODELS = [
    { id: 'googleai/gemini-1.5-flash', name: 'Gemini 1.5 Flash (Google)', provider: 'google' },
    { id: 'googleai/gemini-1.5-pro', name: 'Gemini 1.5 Pro (Google)', provider: 'google' },
    { id: 'googleai/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp (Google)', provider: 'google' },
    { id: 'mistralai/mistral-large-latest', name: 'Mistral Large (Mistral)', provider: 'mistral' },
    { id: 'mistralai/mistral-small-latest', name: 'Mistral Small (Mistral)', provider: 'mistral' },
    { id: 'mistralai/mistral-medium-latest', name: 'Mistral Medium (Mistral)', provider: 'mistral' },
    { id: 'mistralai/pixtral-12b-latest', name: 'Pixtral 12B (Mistral)', provider: 'mistral' },
];

export function AISettingsModal({ open, onOpenChange }: AISettingsModalProps) {
    const { aiApiKey, aiModel, updateAiSettings } = useAppSettings();
    const [localKey, setLocalKey] = useState(aiApiKey);
    const [localModel, setLocalModel] = useState(aiModel);

    useEffect(() => {
        if (open) {
            setLocalKey(aiApiKey);
            setLocalModel(aiModel);
        }
    }, [open, aiApiKey, aiModel]);

    const handleSave = () => {
        updateAiSettings(localKey, localModel);
        toast({
            title: "Configuración guardada",
            description: "La clave API y el modelo han sido actualizados.",
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Configuración de IA
                    </DialogTitle>
                    <DialogDescription>
                        Configura tu propia clave API para el generador de plantillas y procesos.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="model" className="flex items-center gap-2">
                            Modelo de IA
                        </Label>
                        <Select value={localModel} onValueChange={setLocalModel}>
                            <SelectTrigger id="model">
                                <SelectValue placeholder="Selecciona un modelo" />
                            </SelectTrigger>
                            <SelectContent>
                                {MODELS.map((model) => (
                                    <SelectItem key={model.id} value={model.id}>
                                        {model.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="key" className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Clave API (Token)
                        </Label>
                        <Input
                            id="key"
                            type="password"
                            placeholder="Pega tu clave aquí..."
                            value={localKey}
                            onChange={(e) => setLocalKey(e.target.value)}
                            className="font-mono"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Tu clave se guarda localmente en este navegador.
                        </p>
                    </div>

                    <div className="rounded-md bg-muted p-3 text-xs flex items-start gap-2">
                        <ShieldCheck className="h-4 w-4 mt-0.5 text-green-500" />
                        <div>
                            <p className="font-semibold mb-1">Nota de Privacidad</p>
                            <p>Las claves se almacenan de forma segura en las cookies del dispositivo para que las solicitudes al servidor funcionen directamente con tu propio token.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
