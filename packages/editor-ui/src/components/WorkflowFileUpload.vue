<template>
	<Modal
		:name="WORKFLOW_FILE_UPLOAD_MODAL_KEY"
		width="50%"
		max-height="80%"
		title="Upload File"
		:event-bus="modalBus"
		:scrollable="false"
		@keydown.stop
	>
		<template #content>
      <el-form
        label-position="right"
        label-width="auto"
        :model="uploadForm"
      >
        <el-form-item label="Action">
          <el-input v-model="uploadForm.action" placeholder="please enter the url" />
        </el-form-item>
        <el-form-item label="Max Size">
          <el-input-number :min="1" :max="10" :controls="false" type="number" v-model="uploadForm.maxSize" placeholder="please enter the max size"/>
          <span> M</span>
        </el-form-item>
        <el-form-item label="Files">
          <el-upload
            ref="uploadRef"
            v-model:file-list="uploadForm.fileList"
            class="upload-demo"
            :action="uploadForm.action"
            multiple
            :auto-upload="true"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :limit="5"
            :headers="{
              'Authorization': 'AIOS-123'
            }"
            :on-exceed="handleExceed"
            :on-success="handleSuccess"
            :on-error="handleError"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">Upload File</el-button>
            <!-- <template #tip>
              <div class="el-upload__tip" style="font-size:12px">
                jpg/png files with a size less than 500KB.
              </div>
            </template> -->
          </el-upload>
        </el-form-item>
        <!-- <el-form-item>
          <el-button @click="handleUpload">Upload To Server</el-button>
        </el-form-item> -->
        <el-form-item label=" ">
          <el-button @click="handleStartFlow">Start Flow</el-button>
        </el-form-item>
      </el-form>
		</template>
	</Modal>
</template>

<script lang="ts">

import { defineAsyncComponent, defineComponent, ref } from 'vue';
import { mapStores } from 'pinia';

import { useToast } from '@/composables/useToast';
import Modal from '@/components/Modal.vue';
import {
  WORKFLOW_FILE_UPLOAD_MODAL_KEY,
  FILE_UPLOAD_TRIGGER_NODE_TYPE
} from '@/constants';

import { useUIStore } from '@/stores/ui.store';
import { useUsersStore } from '@/stores/users.store';
import { useWorkflowsStore } from '@/stores/workflows.store';
import { createEventBus } from 'n8n-design-system/utils';
import type { IDataObject, INodeType, INode, ITaskData } from 'n8n-workflow';
import type { INodeUi, IUser } from '@/Interface';
import { useExternalHooks } from '@/composables/useExternalHooks';

// eslint-disable-next-line import/no-unresolved
import MessageTyping from '@n8n/chat/components/MessageTyping.vue';
import { useWorkflowHelpers } from '@/composables/useWorkflowHelpers';
import { useRouter } from 'vue-router';
import { useNodeTypesStore } from '@/stores/nodeTypes.store';
import { useRunWorkflow } from '@/composables/useRunWorkflow';

const RunDataAi = defineAsyncComponent(
	async () => await import('@/components/RunDataAi/RunDataAi.vue'),
);
// TODO:
// - display additional information like execution time, tokens used, ...
// - display errors better
export default defineComponent({
	name: 'WorkflowFileUpload',
	components: {
		Modal,
		MessageTyping,
		RunDataAi,
	},
	setup() {
		const router = useRouter();
		const externalHooks = useExternalHooks();
		const workflowHelpers = useWorkflowHelpers({ router });
		const { runWorkflow } = useRunWorkflow({ router });
    const uploadRef = ref<HTMLInputElement | null>(null);

		return {
			runWorkflow,
			externalHooks,
			workflowHelpers,
      uploadRef,
			...useToast(),
		};
	},
	data() {
		return {
			modalBus: createEventBus(),
			node: null as INodeUi | null,
      WORKFLOW_FILE_UPLOAD_MODAL_KEY,
      uploadForm: {
        action: '/file-api/api/pdf/document/upload', // 'https://www.n8n.io/api/workflow-file-upload',
        maxSize: 5,
        fileList: []
      },
      fileInfoList: [
        {
          "uuid": "ee56cc0dc11940fd9f1f74e859d4d243",
          "name": "关于重启上下班考勤打卡的通知.pdf",
          "url": "aios/pdf/ee56cc0dc11940fd9f1f74e859d4d243.pdf"
        },
        {
          "uuid": "ab9800d49d1f411a88057088c4437e45",
          "name": "从稀土废料中回收稀土的研究进展_陈丽杰.pdf",
          "url": "aios/pdf/ab9800d49d1f411a88057088c4437e45.pdf"
        }
        // {
        //   "uuid": "34b8a89f532a4eaa86823f82f8555dfc",
        //   "name": "数据导入模版1 (2).xlsx",
        //   "url": "aios/pdf/34b8a89f532a4eaa86823f82f8555dfc.pdf"
        // }
      ]
		};
	},

	computed: {
		...mapStores(useWorkflowsStore, useUIStore, useNodeTypesStore),
	},
	async mounted() {
    console.log('WORKFLOW_FILE_UPLOAD_MODAL_KEY', WORKFLOW_FILE_UPLOAD_MODAL_KEY)
		
	},
	methods: {

		getTriggerNode(): INode | null {
			const workflow = this.workflowHelpers.getCurrentWorkflow();
			const triggerNode = workflow.queryNodes((nodeType: INodeType) =>
				[FILE_UPLOAD_TRIGGER_NODE_TYPE].includes(nodeType.description.name),
			);

			if (!triggerNode.length) {
				return null;
			}

			return triggerNode[0];
		},
    handleRemove() {
      console.log('handleRemove')
    },
    beforeRemove() {
      console.log('beforeRemove')
    },
    handleExceed() {
      console.log('handleExceed')
      this.showMessage({
        title: 'upload fail!',
        message: "file limit 10",
        type: 'error',
      });
    },
    handleUpload() {
      this.uploadRef.submit();
    },
    handleSuccess(response: any,) {
      if (response.code === 200) {
        this.fileInfoList.push(response.data)
      }
    },
    handleError() {
      this.showMessage({
        title: 'upload fail!',
        message: "file upload fail",
        type: 'error',
      });
    },
    beforeUpload(file: any): boolean {
      // 文件大小超出范围
      if (file.size / 1024 / 1024 > this.uploadForm.maxSize) {
        this.showMessage({
          title: 'upload error!',
          message: "File size exceeds limit",
          type: 'error',
        });
        return false
      }
      return true
    },
    handleStartFlow() {
      console.log('handleUpload', this.fileInfoList.length)
      if (!this.fileInfoList.length) return this.showMessage({
        title: 'start flow fail!',
        message: "The uploaded file cannot be empty",
        type: 'error',
      });
      this.startWorkflow()
    },
    async startWorkflow() {
      const triggerNode = this.getTriggerNode();

			if (!triggerNode) {
				this.showError(
					new Error('Chat Trigger Node could not be found!'),
					'Trigger Node not found',
				);
				return;
			}
      const usersStore = useUsersStore();
			const currentUser = usersStore.currentUser ?? ({} as IUser);

			const nodeData: ITaskData = {
				startTime: new Date().getTime(),
				executionTime: 0,
				executionStatus: 'success',
				data: {
					main: [
						[
							{
								json: {
									sessionId: `test-${currentUser.id || 'unknown'}`,
									action: 'uploadFile',
									fileInfoList: this.fileInfoList,
								},
							},
						],
					],
				},
				source: [null],
			};

			const response = await this.runWorkflow({
				triggerNode: triggerNode.name,
				nodeData,
				source: 'RunData.UploadFile',
			});
    }
	},
});
</script>

<!-- <script lang="ts" scoped>
import type { UploadProps, UploadUserFile } from 'element-plus'
import {
  WORKFLOW_FILE_UPLOAD_MODAL_KEY
} from '@/constants';
import { ref } from 'vue';

const WORKFLOW_FILE_UPLOAD_MODAL_KEY_Ref = ref(WORKFLOW_FILE_UPLOAD_MODAL_KEY);

</script> -->


<style scoped lang="scss">

:deep(.el-input-number) {
  margin-right: 6px;
  .el-input__wrapper {
    width: 100%
  }
}
:deep(.upload-demo) {
  width: 100%;
		.el-upload__input {
			display: none;
		}
    .el-upload__tip {
      line-height: 12px!important;
    }
	}
</style>
