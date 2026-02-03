const convertURLtoBase64 = async (src: string, callback: (dataURL: string) => void) => {  

    const base64 = await fetch(src)
    .then(response => response.blob())
    .then(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise((res) => {
            reader.onloadend = () => {
                res(reader.result);
            }
        })
    })
    .then(base64 => {
        callback(base64 as string);
    });
    return base64;

    //     const image = new Image();
    //     image.crossOrigin = 'Anonymous';
    //     image.onload = function(){
    //        const canvas = document.createElement('canvas');
    //        const context = canvas.getContext('2d');
    //        canvas.height = (this as HTMLImageElement).naturalHeight;
    //        canvas.width = (this as HTMLImageElement).naturalWidth;
    //        context?.drawImage(this as HTMLImageElement, 0, 0);
    //        const dataURL = canvas.toDataURL('image/jpeg');
    //        callback(dataURL);
    //     };
    //     image.src = src;
    //  };
};

export default convertURLtoBase64;