import React, { useEffect, useState } from 'react';
import { Table, Input, Form, Button, Spin } from 'antd';
import { fetchBooks } from '../services/api';
import { DownloadOutlined } from '@ant-design/icons';
import { CSVLink } from 'react-csv';

const { Search } = Input;

const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    const inputNode = <Input />;
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

const BookTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetchBooks();
                setData(result);
                setFilteredData(result);
            } catch (error) {
                console.error('Error fetching book data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
        form.setFieldsValue({ ...record });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setData(newData);
                setFilteredData(newData);
                setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                setFilteredData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const columns = [
        { title: 'Ratings Average', dataIndex: 'ratings_average', key: 'ratings_average', sorter: (a, b) => a.ratings_average - b.ratings_average, editable: true },
        { title: 'Author Name', dataIndex: 'author_name', key: 'author_name', sorter: (a, b) => a.author_name.localeCompare(b.author_name), editable: true },
        { title: 'Title', dataIndex: 'title', key: 'title', sorter: (a, b) => a.title.localeCompare(b.title), editable: true },
        { title: 'First Publish Year', dataIndex: 'first_publish_year', key: 'first_publish_year', sorter: (a, b) => a.first_publish_year - b.first_publish_year, editable: true },
        { title: 'Subject', dataIndex: 'subject', key: 'subject', sorter: (a, b) => a.subject.localeCompare(b.subject), editable: true },
        { title: 'Author Birth Date', dataIndex: 'author_birth_date', key: 'author_birth_date', sorter: (a, b) => a.author_birth_date.localeCompare(b.author_birth_date), editable: true },
        { title: 'Author Top Work', dataIndex: 'author_top_work', key: 'author_top_work', sorter: (a, b) => a.author_top_work.localeCompare(b.author_top_work), editable: true },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Button onClick={() => save(record.key)} type="link" style={{ marginRight: 8 }}>
                            Save
                        </Button>
                        <Button onClick={cancel} type="link">
                            Cancel
                        </Button>
                    </span>
                ) : (
                    <Button disabled={editingKey !== ''} onClick={() => edit(record)} type="link">
                        Edit
                    </Button>
                );
            },
        },
    ];

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    const handleSearch = (value) => {
        const filtered = data.filter((item) => {
            const authorName = item.author_name || ""; // Ensure author_name is a string or an empty string
            return authorName.toString().toLowerCase().includes(value.toLowerCase());
        });
        setFilteredData(filtered);
    };

    return (
        <>
            <Search placeholder="Search by author" onSearch={handleSearch} enterButton style={{ marginBottom: 20 }} />
            {loading ? (
                <Spin />
            ) : (
                <Form form={form} component={false}>
                    <Table
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        bordered
                        dataSource={filteredData}
                        columns={mergedColumns}
                        rowClassName="editable-row"
                        pagination={{
                            onChange: cancel,
                            defaultPageSize: 10,
                            pageSizeOptions: ['10', '50', '100'],
                            showSizeChanger: true,
                        }}
                    />
                    <CSVLink data={filteredData} filename="books.csv">
                        <Button type="primary" icon={<DownloadOutlined />}>
                            Download CSV
                        </Button>
                    </CSVLink>
                </Form>
            )}
        </>
    );
};

export default BookTable;

