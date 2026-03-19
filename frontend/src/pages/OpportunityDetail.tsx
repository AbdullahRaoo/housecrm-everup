import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useOpportunity } from '../context/OpportunityContext';
import { useAuth } from '../hooks/useAuth';
import { Opportunity } from '../types/opportunity';

function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOpportunity, deleteOpportunity, state: { selectedOpportunity, loading, error } } = useOpportunity();
  const { token } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchOpportunity = useCallback(async () => {
    if (id && token) {
      await getOpportunity(id);
    }
  }, [id, token, getOpportunity]);

  useEffect(() => {
    fetchOpportunity();
  }, [fetchOpportunity]);

  const handleDelete = async () => {
    try {
      if (!id) return;
      await deleteOpportunity(id);
      navigate('/opportunities');
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      // Keep modal open if error occurs
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Proposed':
        return 'bg-blue-100 text-blue-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#e56e43]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      </div>
    );
  }

  if (!selectedOpportunity) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          <strong className="font-bold">¡Advertencia!</strong>
          <span className="block sm:inline ml-2">Oportunidad no encontrada.</span>
        </div>
      </div>
    );
  }

  const opportunity = selectedOpportunity as Opportunity;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h3 className="text-gray-700 text-3xl font-medium">{opportunity.title}</h3>
          <span
            className={`ml-4 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(opportunity.status)}`}
          >
            {opportunity.status}
          </span>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/opportunities/edit/${id}`}
            className="px-4 py-2 bg-[#e56e43] text-white rounded-lg hover:bg-[#e56e43]/90 transition-colors duration-200 font-medium"
          >
            Editar
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700">Detalles de la oportunidad</h4>
            </div>
            <div className="p-6">
              {opportunity.description && (
                <div className="mb-6">
                  <h5 className="text-gray-600 font-medium mb-2">Descripción</h5>
                  <p className="text-gray-800">{opportunity.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="text-gray-600 font-medium mb-2">Presupuesto</h5>
                  <p className="text-2xl font-bold text-[#e56e43]">
                    {formatCurrency(opportunity.budget.amount, opportunity.budget.currency)}
                  </p>
                </div>
                <div>
                  <h5 className="text-gray-600 font-medium mb-2">Válido hasta</h5>
                  <p className="text-gray-800">
                    {formatDate(opportunity.validUntil)}
                  </p>
                </div>
                <div>
                  <h5 className="text-gray-600 font-medium mb-2">Cliente</h5>
                  <Link
                    to={`/customers/${opportunity.customerId}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {opportunity.customer?.name || 'Cliente desconocido'}
                  </Link>
                  {opportunity.customer?.email && (
                    <p className="text-gray-500 text-sm mt-1">{opportunity.customer.email}</p>
                  )}
                </div>
                {opportunity.propertyId && (
                  <div>
                    <h5 className="text-gray-600 font-medium mb-2">Propiedad relacionada</h5>
                    <Link
                      to={`/properties/${opportunity.propertyId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {opportunity.property?.title || 'Ver propiedad'}
                    </Link>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <p>Creado: {formatDate(opportunity.createdAt)}</p>
                </div>
                <div>
                  <p>Última actualización: {formatDate(opportunity.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Income Scenarios Section */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-700">Escenarios de ingreso</h4>
              <Link
                to={`/opportunities/edit/${id}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Agregar/Editar escenarios
              </Link>
            </div>

            {opportunity.incomeScenarios && opportunity.incomeScenarios.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Escenario
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ingreso
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Gastos
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ingreso neto
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ROI
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Probabilidad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {opportunity.incomeScenarios.map((scenario, index) => {
                      const netIncome = scenario.income - scenario.expenses;
                      return (
                        <tr key={scenario._id || index}>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div className="flex items-center">
                              <div className="ml-3">
                                <p className="text-gray-900 whitespace-no-wrap font-medium">
                                  {scenario.name}
                                </p>
                                {scenario.description && (
                                  <p className="text-gray-600 whitespace-no-wrap">{scenario.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {formatCurrency(scenario.income, opportunity.budget.currency)}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {formatCurrency(scenario.expenses, opportunity.budget.currency)}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className={`whitespace-no-wrap font-medium ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(netIncome, opportunity.budget.currency)}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {scenario.roi !== undefined ? `${scenario.roi.toFixed(2)}%` : 'N/A'}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${scenario.probability}%` }}
                                ></div>
                              </div>
                              <span className="ml-2">{scenario.probability}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Aún no se han agregado escenarios de ingreso.
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700">Resumen</h4>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h5 className="text-gray-600 font-medium mb-2">Presupuesto total</h5>
                <p className="text-2xl font-bold text-[#e56e43]">
                  {formatCurrency(opportunity.budget.amount, opportunity.budget.currency)}
                </p>
              </div>

              {opportunity.incomeScenarios && opportunity.incomeScenarios.length > 0 && (
                <>
                  <div className="mb-4">
                    <h5 className="text-gray-600 font-medium mb-2">Ingreso potencial (más alto)</h5>
                    <p className="text-xl font-semibold text-green-600">
                      {formatCurrency(
                        Math.max(...opportunity.incomeScenarios.map(s => s.income)),
                        opportunity.budget.currency
                      )}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-gray-600 font-medium mb-2">Ingreso promedio ponderado</h5>
                    <p className="text-xl font-semibold text-green-600">
                      {formatCurrency(
                        opportunity.incomeScenarios.reduce((sum, scenario) =>
                          sum + (scenario.income * scenario.probability / 100), 0),
                        opportunity.budget.currency
                      )}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-gray-600 font-medium mb-2">Mejor ROI</h5>
                    <p className="text-xl font-semibold text-blue-600">
                      {opportunity.incomeScenarios
                        .filter(s => s.roi !== undefined)
                        .sort((a, b) => (b.roi || 0) - (a.roi || 0))[0]?.roi?.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {opportunity.incomeScenarios
                        .filter(s => s.roi !== undefined)
                        .sort((a, b) => (b.roi || 0) - (a.roi || 0))[0]?.name}
                    </p>
                  </div>
                </>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  to={opportunity.customerId ? `/customers/${opportunity.customerId}` : '/customers'}
                  className="block px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-center mb-2"
                >
                  Ver cliente
                </Link>
                {opportunity.propertyId && (
                  <Link
                    to={`/properties/${opportunity.propertyId}`}
                    className="block px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-center"
                  >
                    Ver propiedad
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700">Acciones</h4>
            </div>
            <div className="p-6">
              <button
                onClick={() => {
                  // We're redirecting to edit page without using status
                  navigate(`/opportunities/edit/${id}`);
                }}
                className="block w-full px-4 py-2 bg-[#e56e43] hover:bg-[#e56e43]/90 text-white rounded-lg text-center mb-3"
              >
                {opportunity.status === 'Draft' ? 'Marcar como propuesta' :
                  opportunity.status === 'Proposed' ? 'Marcar como aceptada' : 'Actualizar estado'}
              </button>

              <button
                onClick={() => {
                  // Here you would implement creating a task related to this opportunity
                  navigate(`/calendar?opportunityId=${id}`);
                }}
                className="block w-full px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-center"
              >
                Agendar tarea relacionada
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmar eliminación</h3>
            <p>¿Está seguro de que desea eliminar esta oportunidad? Esta acción no se puede deshacer.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OpportunityDetail;
