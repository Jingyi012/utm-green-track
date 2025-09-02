import { EnquiryInput } from "@/lib/types/typing";
import { ModalForm, ProFormText } from "@ant-design/pro-components";

interface CreateEnquiryModalProps {
    onCancel: () => void;
    onSubmit: (values: EnquiryInput) => Promise<boolean>;
    visible: boolean;
}

export const CreateEnquiryModal: React.FC<CreateEnquiryModalProps> = ({
    onCancel,
    onSubmit,
    visible
}) => {

    return (<>
        <ModalForm
            title="Create Enquiry"
            open={visible}
            modalProps={{
                destroyOnHidden: true,
                onCancel: () => {
                    onCancel();
                },
            }}
            onOpenChange={(open) => {
                if (!open) {
                    onCancel();
                }
            }}
            onFinish={onSubmit}
        >
            <ProFormText
                label="Subject"
                name="subject"
                placeholder="Please enter subject"
                rules={[{ required: true }]}
            />
            <ProFormText
                label="Message"
                name="message"
                placeholder="Please enter message"
                rules={[{ required: true }]}
            />
        </ModalForm>
    </>
    );
}