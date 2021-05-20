interface Props {
    regionRecord: {
        count: number,
        date: Date,
        id: number,
        regionName: string,
        status: number,
        total: number
    };
    pageX: number;
    pageY: number;
    canManage: boolean;
    showDropdown: boolean;
    onView: (id: number, year: number) => Promise<void>;
    onCancel: (id: number) => Promise<void>;
}

export default Props;