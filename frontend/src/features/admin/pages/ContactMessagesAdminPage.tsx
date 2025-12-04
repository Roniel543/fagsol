'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useAdminContactMessages, useUpdateContactMessage } from '@/shared/hooks/useAdminContactMessages';
import { ContactMessage } from '@/shared/services/adminContactMessages';
import { Archive, CheckCircle2, Clock, Eye, Filter, Mail, MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';

export function ContactMessagesAdminPage() {
    const [filters, setFilters] = useState<{ status?: 'new' | 'read' | 'replied' | 'archived'; search?: string }>({});
    const { messages, isLoading, mutate } = useAdminContactMessages(filters);
    const { updateContactMessage, isUpdating } = useUpdateContactMessage();
    const { showToast } = useToast();
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

    const handleStatusChange = async (messageId: number, newStatus: ContactMessage['status']) => {
        try {
            await updateContactMessage(messageId, { status: newStatus });
            mutate();
            if (selectedMessage?.id === messageId) {
                setSelectedMessage({ ...selectedMessage, status: newStatus });
            }
        } catch (error) {
            // Error ya manejado en el hook
        }
    };

    const handleSaveNotes = async (messageId: number) => {
        try {
            await updateContactMessage(messageId, { admin_notes: adminNotes });
            mutate();
            if (selectedMessage?.id === messageId) {
                setSelectedMessage({ ...selectedMessage, admin_notes: adminNotes });
            }
            showToast('Notas guardadas exitosamente', 'success');
        } catch (error) {
            // Error ya manejado en el hook
        }
    };

    const getStatusBadge = (status: ContactMessage['status']) => {
        const config = {
            new: { label: 'Nuevo', className: 'bg-blue-100 text-blue-800', icon: <Mail className="w-3 h-3" /> },
            read: { label: 'Leído', className: 'bg-yellow-100 text-yellow-800', icon: <Eye className="w-3 h-3" /> },
            replied: { label: 'Respondido', className: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> },
            archived: { label: 'Archivado', className: 'bg-gray-100 text-gray-800', icon: <Archive className="w-3 h-3" /> },
        };
        const statusConfig = config[status] || config.new;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                {statusConfig.icon}
                {statusConfig.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const newMessagesCount = messages.filter(m => m.status === 'new').length;

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mensajes de Contacto</h1>
                        <p className="text-gray-700 mt-1 font-medium">Gestiona los mensajes recibidos desde el formulario de contacto</p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md border-2 border-gray-200 p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            <Search className="w-4 h-4 inline mr-1" />
                            Búsqueda
                        </label>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, teléfono..."
                            value={filters.search || ''}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            <Filter className="w-4 h-4 inline mr-1" />
                            Estado
                        </label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => setFilters({
                                ...filters,
                                status: (e.target.value as 'new' | 'read' | 'replied' | 'archived') || undefined
                            })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                        >
                            <option value="">Todos</option>
                            <option value="new">Nuevo ({newMessagesCount})</option>
                            <option value="read">Leído</option>
                            <option value="replied">Respondido</option>
                            <option value="archived">Archivado</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="secondary"
                            onClick={() => setFilters({})}
                            className="w-full"
                        >
                            Limpiar Filtros
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                </div>
            ) : messages.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-12 text-center">
                    <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No hay mensajes</h3>
                    <p className="text-gray-700 font-medium">No se encontraron mensajes con los filtros seleccionados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lista de mensajes */}
                    <div className="lg:col-span-2 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`bg-white rounded-xl shadow-md border-2 transition-all cursor-pointer ${selectedMessage?.id === message.id
                                    ? 'border-primary-orange shadow-xl ring-2 ring-primary-orange/30 bg-gradient-to-br from-white to-orange-50/30'
                                    : 'border-gray-200 hover:border-primary-orange/60 hover:shadow-xl hover:bg-gray-50/50'
                                    }`}
                                onClick={() => {
                                    setSelectedMessage(message);
                                    setAdminNotes(message.admin_notes || '');
                                }}
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-1 text-base">{message.name}</h3>
                                            <p className="text-sm text-gray-800 font-medium">{message.email}</p>
                                            <p className="text-sm text-gray-700 font-medium">{message.phone}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(message.status)}
                                            {message.status === 'new' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                                                    Nuevo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-900 line-clamp-2 mb-3 font-medium leading-relaxed">{message.message}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-700 font-semibold">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(message.created_at)}
                                        </div>
                                        {message.read_at && (
                                            <span className="text-gray-600">Leído: {formatDate(message.read_at)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Panel de detalles */}
                    <div className="lg:col-span-1">
                        {selectedMessage ? (
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border-2 border-gray-200 p-6 sticky top-6">
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles del Mensaje</h2>
                                    <div className="space-y-3 mb-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Nombre</label>
                                            <p className="text-sm text-gray-900 font-semibold mt-1">{selectedMessage.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email</label>
                                            <p className="text-sm mt-1">
                                                <a href={`mailto:${selectedMessage.email}`} className="text-primary-orange hover:underline font-semibold">
                                                    {selectedMessage.email}
                                                </a>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Teléfono</label>
                                            <p className="text-sm mt-1">
                                                <a href={`tel:${selectedMessage.phone}`} className="text-primary-orange hover:underline font-semibold">
                                                    {selectedMessage.phone}
                                                </a>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Mensaje</label>
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap mt-1 font-medium leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">{selectedMessage.message}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Fecha de Envío</label>
                                            <p className="text-sm text-gray-900 font-semibold mt-1">{formatDate(selectedMessage.created_at)}</p>
                                        </div>
                                        {selectedMessage.read_at && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Fecha de Lectura</label>
                                                <p className="text-sm text-gray-900 font-semibold mt-1">{formatDate(selectedMessage.read_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Cambiar Estado */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Cambiar Estado</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            className="bg-red-500"
                                            variant={selectedMessage.status === 'read' ? 'primary' : 'secondary'}
                                            size="sm"
                                            onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                                            disabled={isUpdating || selectedMessage.status === 'read'}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Leídso
                                        </Button>
                                        <Button
                                            variant={selectedMessage.status === 'replied' ? 'primary' : 'secondary'}
                                            size="sm"
                                            onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                                            disabled={isUpdating || selectedMessage.status === 'replied'}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-1" />
                                            Respondido
                                        </Button>
                                        <Button
                                            variant={selectedMessage.status === 'archived' ? 'primary' : 'secondary'}
                                            size="sm"
                                            onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                                            disabled={isUpdating || selectedMessage.status === 'archived'}
                                        >
                                            <Archive className="w-4 h-4 mr-1" />
                                            Archivado
                                        </Button>
                                    </div>
                                </div>

                                {/* Notas del Admin */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Notas del Administrador</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-sm font-medium"
                                        placeholder="Agrega notas internas sobre este mensaje..."
                                    />
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleSaveNotes(selectedMessage.id)}
                                        disabled={isUpdating}
                                        className="mt-2 w-full font-semibold"
                                    >
                                        Guardar Notas
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border-2 border-gray-200 p-12 text-center">
                                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-800 font-semibold">Selecciona un mensaje para ver los detalles</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

