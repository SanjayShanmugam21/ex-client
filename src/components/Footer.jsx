const Footer = () => {
    return (
        <footer className="py-6 px-12 bg-white border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} ExpensePro. All rights reserved.</p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
