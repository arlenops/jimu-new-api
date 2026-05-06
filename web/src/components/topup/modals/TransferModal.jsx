/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Modal, Typography, Input, InputNumber } from '@douyinfe/semi-ui';
import { CreditCard } from 'lucide-react';
import {
  formatUsdAmount,
  quotaToUsdAmount,
} from '../../../helpers/quota';

const TransferModal = ({
  t,
  openTransfer,
  transfer,
  handleTransferCancel,
  userState,
  getQuotaPerUnit,
  transferAmount,
  setTransferAmount,
}) => {
  const availableRewardUsd = quotaToUsdAmount(userState?.user?.aff_quota || 0);
  const minTransferUsd = quotaToUsdAmount(getQuotaPerUnit());

  return (
    <Modal
      title={
        <div className='flex items-center'>
          <CreditCard className='mr-2' size={18} />
          {t('划转邀请额度')}
        </div>
      }
      visible={openTransfer}
      onOk={transfer}
      onCancel={handleTransferCancel}
      maskClosable={false}
      centered
      width={460}
      className='va-transfer-modal'
      okText={t('确认划转')}
      cancelText={t('取消')}
    >
      <div className='va-transfer-modal__content space-y-4'>
        <div className='va-transfer-modal__field'>
          <Typography.Text strong className='block mb-2'>
            {t('可用邀请额度')}
          </Typography.Text>
          <Input
            value={formatUsdAmount(availableRewardUsd)}
            disabled
            className='!rounded-lg'
          />
        </div>
        <div className='va-transfer-modal__field'>
          <Typography.Text strong className='block mb-2'>
            {t('划转额度')} · {t('最低') + formatUsdAmount(minTransferUsd)}
          </Typography.Text>
          <InputNumber
            min={minTransferUsd}
            max={availableRewardUsd}
            precision={2}
            step={0.01}
            value={transferAmount}
            onChange={(value) => setTransferAmount(value)}
            prefix='$'
            className='w-full !rounded-lg'
          />
        </div>
      </div>
    </Modal>
  );
};

export default TransferModal;
