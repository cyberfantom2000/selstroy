

export const MediaEvents = {
    Request: {
        Open: 'media:open:request',
        CopyId: 'media:copy:id:request',
        CopyLink: 'media:copy:link:request',
        Download: 'media:download:request',
        Remove: 'media:remove:request',
        Upload: 'media:upload:request',
    },
    Update: 'media:update',
    Clear: 'media:clear',
    Error: 'media:error',
};


export const MediaErrorType = {
    Upload: 'upload',
    Download: 'download',
};


export const PromoEvents = {
    Request: {
        Create: 'promo:create:request',
        Edit: 'promo:edit:request',
        ToggleDraft: 'promo:toggle:draft:request',
        Remove: 'promo:remove:request'
    },
    Update: 'promo:update',
    Clear: 'promo:clear',
    Error: 'promo:error',
};


export const ProjectEvents = {
    Request: {
        Image: {
            Open: 'project:image:open:request',
            Create: 'project:image:add:request',
            Edit: 'project:image:edit:request',
            Remove: 'project:image:remove:request',
        },
        IFrame: {
            Open: 'project:iframe:open:request',
            Edit: 'project:iframe:edit:request',
            Remove: 'project:iframe:remove:request'
        },
        ProjectDetail: {
            Create: 'project:detail:create:request',
            Edit: 'project:detail:edit:request',
            Remove: 'project:detail:remove:request',
        },
        Project: {
            Create: 'project:create:request',
            Edit: 'project:edit:request',
            Preview: 'project:preview:request',
            ToggleDraft: 'project:toggle:draft:request',
            Remove: 'project:remove:request'
        }
    },
    Update: 'project:update',
    Clear: 'project:clear',
    Error: 'project:error',
};


export const ProjectImageType = {
    Preview: 'preview',
    MasterPlan: 'master-plan',
    Detail: 'detail',
    Description: 'description',
};

export const ProjectDetailType = {
    Description: 'description',
    Detail: 'detail',
};

export const ProjectIFrameType = {
    LiveMap: 'live-map',
};


export const ApartmentEvents = {
    Request: {
        Image: {
            Open: 'apartment:image:open:request',
            Create: 'apartment:image:add:request',
            Edit: 'apartment:image:edit:request',
            Remove: 'apartment:image:remove:request',
        },
        Floor: {
            Create: 'apartment:floor:create',
            Edit: 'apartment:floor:edit',
            Remove: 'apartment:floor:remove',
        },
        Apartment: {
            Create: 'apartment:create:request',
            Edit: 'apartment:edit:request',
            Preview: 'apartment:preview:request',
            ToggleDraft: 'apartment:toggle:draft:request',
            Remove: 'apartment:remove:request'
        }
    },
    Update: 'apartment:update',
    Clear: 'apartment:clear',
    Error: 'apartment:error'
};


export const GalleryEvents = {
    Request: {
        Open: 'gallery:item:open:request',
        Create: 'gallery:item:create:request',
        Edit: 'gallery:item:edit:request',
        Remove: 'gallery:item:remove:request'
    },
    Update: 'gallery:update',
    Clear: 'gallery:clear',
    Error: 'gallery:error',
};


export const ModelErrorType = {
    Load: 'load',
    Create: 'create',
    Edit: 'download',
    Remove: 'remove',
};


export const ModalEvents = {
    Confirm: {
        Open: 'modal:confirm:open',
        Confirmed: 'modal:confirm:confirmed',
        Rejected: 'modal:confirm:rejected',
    },
    Tooltip: {
        Open: 'modal:tooltip:open',
        Rejected: 'modal:tooltip:rejected'
    },
    Media: {
        Open: 'modal:media:open',
    },
    Promo: {
        Open: 'modal:promo:open',
        Confirmed: 'modal:promo:confirmed',
        Rejected: 'modal:promo:rejected',
    },
    Project : {
        Open: 'modal:project:open',
        Confirmed: 'modal:project:confirmed',
        Rejected: 'modal:project:rejected',
    },
    ProjectDetail: {
        Open: 'modal:project:detail:open',
        Confirmed: 'modal:project:detail:confirmed',
        Rejected: 'modal:project:detail:rejected',
    },
    ImageView: {
        Open: 'modal:image:view:open',
        Rejected: 'modal:image:view:rejected',
    },
    IFrameView: {
        Open: 'modal:iframe:view:open',
        Rejected: 'modal:iframe:view:rejected',
    },
    EditableImage: {
        Open: 'modal:image:edit:open',
        Confirmed: 'modal:image:edit:confirmed',
        Rejected: 'modal:image:edit:rejected',
    },
    EditableIFrame: {
        Open: 'modal:iframe:edit:open',
        Confirmed: 'modal:iframe:edit:confirmed',
        Rejected: 'modal:iframe:edit:rejected',
    },
    Apartment: {
        Open: 'modal:apartment:open',
        Confirmed: 'modal:apartment:confirmed',
        Rejected: 'modal:apartment:rejected',
    },
    ApartmentFloor: {
        Open: 'modal:apartment:floor:open',
        Confirmed: 'modal:apartment:floor:confirmed',
        Rejected: 'modal:apartment:floor:rejected',
    },
    ApartmentImage: {
        Open: 'modal:apartment:image:open',
        Confirmed: 'modal:apartment:image:confirmed',
        Rejected: 'modal:apartment:image:rejected',
    },
    GalleryItem: {
        Open: 'modal:gallery:item:open',
        Confirmed: 'modal:gallery:item:confirmed',
        Rejected: 'modal:gallery:item:rejected',
    },
    SideLeft: {
        Open: 'modal:side:left:open',
        Confirmed: 'modal:side:left:confirmed',
        Rejected: 'modal:side:left:rejected',
    },
    SideRight: {
        Open: 'modal:side:right:open',
        Clear: 'modal:side:right:clear',
        Confirmed: 'modal:side:right:confirmed',
        Rejected: 'modal:side:right:rejected',
    },
    ImageGallery: {
        Open: 'modal:image:gallery:open',
        Next: 'modal:image:gallery:next',
        Previous: 'modal:image:gallery:previous',
        Closed: 'modal:image:gallery:closed'
    }
};


export const SubpageEvents = {
    Request: {
        Update: 'subpage:update:request',
        Load: 'subpage:load:request',
    },
    Update: 'subpage:update',
};


export const PopupEvents = {
    Message: {
        Show: 'popup:message:show',
        Remove: 'popup:message:remove',
        Hover: 'popup:message:hover',
        HoverEnd: 'popup:message:hoverend',
        Inf: { Show: 'popup:message:inf:show' },
        Wrn: { Show: 'popup:message:wrn:show' },
        Err: { Show: 'popup:message:err:show' },
    },
};


export const FeedbackEvents = {
    Message: {
        Success: 'feedback:message:success',
    },
    Recall: {
        Success: 'feedback:recall:success',
    },
    Error: 'feedback:recall:error'
};
