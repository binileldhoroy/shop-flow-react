import React, { useEffect, useState } from 'react';
import { priceTierService, PriceTier, ProductTierPrice } from '@api/services/priceTier.service';
import { Trash2, Plus, Tag } from 'lucide-react';
import { addNotification } from '@store/slices/uiSlice';
import { useAppDispatch } from '@hooks/useRedux';

interface Props {
  productId: number;
}

const ProductPriceTiers: React.FC<Props> = ({ productId }) => {
  const dispatch = useAppDispatch();
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [rules, setRules] = useState<ProductTierPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // New Rule State
  const [newRuleTier, setNewRuleTier] = useState<number | ''>('');
  const [newRuleType, setNewRuleType] = useState<'percentage' | 'fixed'>('percentage');
  const [newRuleValue, setNewRuleValue] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tiersData, rulesData] = await Promise.all([
        priceTierService.getAllTiers(),
        priceTierService.getProductRules(productId)
      ]);
      setTiers(tiersData.filter(t => t.is_active));
      setRules(rulesData);
    } catch (error) {
      console.error('Failed to load price tier data', error);
      dispatch(addNotification({ message: 'Failed to load price rules', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  const handleAddRule = async () => {
    if (!newRuleTier || !newRuleValue) {
        dispatch(addNotification({ message: 'Please fill all fields', type: 'error' }));
        return;
    }

    try {
      setAdding(true);
      await priceTierService.createProductRule({
        product: productId,
        tier: Number(newRuleTier),
        type: newRuleType,
        value: Number(newRuleValue)
      });

      dispatch(addNotification({ message: 'Price rule added', type: 'success' }));
      setNewRuleTier('');
      setNewRuleValue('');
      setNewRuleType('percentage');
      fetchData(); // Reload
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.non_field_errors?.[0] || 'Failed to add rule';
      dispatch(addNotification({ message: msg, type: 'error' }));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
        await priceTierService.deleteProductRule(ruleId);
        dispatch(addNotification({ message: 'Rule removed', type: 'success' }));
        setRules(prev => prev.filter(r => r.id !== ruleId));
    } catch (error) {
        dispatch(addNotification({ message: 'Failed to remove rule', type: 'error' }));
    }
  };

  if (loading && rules.length === 0) {
      return <div className="text-gray-500 text-sm">Loading price rules...</div>;
  }

  // Filter out tiers that already have rules to prevent duplicates in dropdown
  const availableTiers = tiers.filter(t => !rules.some(r => r.tier === t.id));

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4" />
        Price Tier Customization
      </h3>

      <p className="text-sm text-gray-500 mb-4">
        Define specific pricing for customer groups. Rules override the tier's default percentage.
      </p>

      {/* Add New Rule */}
      <div className="flex flex-wrap gap-2 items-end mb-4 p-3 bg-white rounded border border-gray-200 shadow-sm">
        <div className="flex-1 min-w-[150px]">
           <label className="text-xs font-medium text-gray-700 mb-1 block">Tier Group</label>
           <select
             className="input-field py-1 text-sm"
             value={newRuleTier}
             onChange={(e) => setNewRuleTier(Number(e.target.value))}
           >
             <option value="">Select Tier</option>
             {availableTiers.map(t => (
               <option key={t.id} value={t.id}>{t.name} (Default: {t.default_percentage}%)</option>
             ))}
           </select>
        </div>

        <div className="w-[120px]">
           <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
           <select
             className="input-field py-1 text-sm"
             value={newRuleType}
             onChange={(e) => setNewRuleType(e.target.value as any)}
           >
             <option value="percentage">Percentage (+/-)</option>
             <option value="fixed">Fixed Price (₹)</option>
           </select>
        </div>

        <div className="w-[100px]">
           <label className="text-xs font-medium text-gray-700 mb-1 block">Value</label>
           <input
             type="number"
             className="input-field py-1 text-sm"
             placeholder={newRuleType === 'percentage' ? "5.0" : "500"}
             value={newRuleValue}
             onChange={(e) => setNewRuleValue(e.target.value)}
           />
        </div>

        <button
          onClick={handleAddRule}
          disabled={adding || !newRuleTier}
          className="btn btn-primary py-1 px-3 h-[34px]"
        >
          {adding ? 'Adding...' : <><Plus className="w-4 h-4 mr-1" /> Add</>}
        </button>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-sm">
          No custom rules. Default tier percentages will apply.
        </div>
      ) : (
        <div className="bg-white border rounded overflow-hidden">
           <table className="w-full text-sm text-left">
             <thead className="bg-gray-50 text-gray-600 font-medium border-b">
               <tr>
                 <th className="p-2 pl-3">Tier Name</th>
                 <th className="p-2">Rule</th>
                 <th className="p-2 text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {rules.map(rule => (
                 <tr key={rule.id}>
                   <td className="p-2 pl-3 font-medium">{rule.tier_name}</td>
                   <td className="p-2">
                     {rule.type === 'fixed' ? (
                       <span className="text-primary-600 font-bold">₹{rule.value}</span>
                     ) : (
                       <span className={Number(rule.value) >= 0 ? 'text-success-600' : 'text-danger-600'}>
                         {Number(rule.value) > 0 ? '+' : ''}{rule.value}%
                       </span>
                     )}
                   </td>
                   <td className="p-2 text-right">
                     <button
                       onClick={() => handleDeleteRule(rule.id)}
                       className="text-gray-400 hover:text-danger-500 p-1"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default ProductPriceTiers;
